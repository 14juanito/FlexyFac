const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const https = require('https');
const { getDb } = require('../config/database');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

exports.genererBonPDF = async (req, res) => {
  try {
    const { etudiant_id, type_frais_id, montant_usd } = req.body;
    if (!etudiant_id || !type_frais_id || !montant_usd) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    const db = getDb();
    if (!db) return res.status(500).json({ error: 'Base de données non disponible' });

    const etudiant = db.prepare('SELECT * FROM Etudiants WHERE id = ?').get(etudiant_id);
    const typeFrais = db.prepare('SELECT * FROM TypesFrais WHERE id = ?').get(type_frais_id);
    if (!etudiant || !typeFrais) return res.status(404).json({ error: 'Étudiant ou type de frais introuvable' });
    if (typeFrais.faculte !== etudiant.faculte) return res.status(400).json({ error: 'Ce type de frais ne correspond pas à votre faculté' });
    if (montant_usd > typeFrais.montant_usd) return res.status(400).json({ error: `Le montant ne peut pas dépasser $${typeFrais.montant_usd}` });

    const tauxResult = db.prepare('SELECT valeur FROM Config WHERE cle = ? AND actif = 1').get('taux_usd_cdf');
    const tauxChange = tauxResult ? parseFloat(tauxResult.valeur) : 2850;
    const montantCdf = Math.round(montant_usd * tauxChange);

    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const checksum = (timestamp % 1000).toString().padStart(3, '0');
    const bonId = `BON${checksum}${random}`;

    const result = db.prepare(`
      INSERT INTO Paiements (etudiant_id, type_frais_id, montant_usd, montant_cdf,
                           mode_paiement, statut, bon_id, date_paiement, notes)
      VALUES (?, ?, ?, ?, 'BON_PHYSIQUE', 'EN_ATTENTE', ?, datetime('now'), ?)
    `).run(etudiant_id, type_frais_id, montant_usd, montantCdf, bonId, 'Bon généré automatiquement - Valide 30 jours');

    const fileName = `bon_${bonId}_${timestamp}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    await genererPDFBon({ etudiant, typeFrais, montant_usd, montantCdf, tauxChange, bonId, filePath, paiementId: result.lastInsertRowid });

    const dateExpiration = new Date();
    dateExpiration.setDate(dateExpiration.getDate() + 30);

    res.json({
      success: true,
      message: 'Bon de paiement PDF généré avec succès',
      bon: {
        id: result.lastInsertRowid,
        bon_id: bonId,
        fileName,
        downloadUrl: `/api/pdf-bon/download/${fileName}`,
        etudiant: { nom: `${etudiant.prenom} ${etudiant.nom}`, matricule: etudiant.matricule, faculte: etudiant.faculte, email: etudiant.email },
        frais: { nom: typeFrais.nom, description: typeFrais.description },
        montant: { usd: montant_usd, cdf: montantCdf, taux: tauxChange },
        dates: { generation: new Date().toISOString(), expiration: dateExpiration.toISOString() }
      }
    });
  } catch (error) {
    console.error('Erreur génération bon PDF:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du bon PDF' });
  }
};

exports.telechargerBonPDF = (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(uploadsDir, fileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Fichier non trouvé' });
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Erreur téléchargement:', err);
        res.status(500).json({ error: 'Erreur lors du téléchargement' });
      }
    });
  } catch (error) {
    console.error('Erreur téléchargement bon PDF:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

exports.listerBonsEtudiant = async (req, res) => {
  try {
    const { etudiant_id } = req.params;
    const db = getDb();
    if (!db) return res.status(500).json({ error: 'Base de données non disponible' });

    const bons = db.prepare(`
      SELECT p.*, tf.nom as type_frais_nom, tf.description as type_frais_description,
             e.nom, e.prenom, e.matricule
      FROM Paiements p
      JOIN TypesFrais tf ON p.type_frais_id = tf.id
      JOIN Etudiants e ON p.etudiant_id = e.id
      WHERE p.etudiant_id = ? AND p.mode_paiement = 'BON_PHYSIQUE'
      ORDER BY p.date_paiement DESC
    `).all(etudiant_id);

    res.json({ success: true, bons: bons.map(bon => ({
      ...bon,
      etudiant_nom: `${bon.prenom} ${bon.nom}`,
      date_expiration: new Date(new Date(bon.date_paiement).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      expire_bientot: new Date(new Date(bon.date_paiement).getTime() + 30 * 24 * 60 * 60 * 1000) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })) });
  } catch (error) {
    console.error('Erreur liste bons:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des bons' });
  }
};

function chargerLogoHttps(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      if (resp.statusCode !== 200) return reject(new Error(`HTTP ${resp.statusCode}`));
      const chunks = [];
      resp.on('data', d => chunks.push(d));
      resp.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function genererPDFBon(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: [842, 473] });

      let logoBuffer = null;
      try {
        const logoUrl = process.env.UPC_LOGO_URL || 'https://upc.ac.cd/assets/img/logo.png';
        logoBuffer = await chargerLogoHttps(logoUrl);
      } catch (e) {
        console.warn('Logo UPC indisponible, poursuite sans logo:', e.message);
      }

      doc.pipe(fs.createWriteStream(data.filePath));

      const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify({
        bon_id: data.bonId,
        matricule: data.etudiant.matricule,
        montant_usd: data.montant_usd,
        montant_cdf: data.montantCdf,
        date_generation: new Date().toISOString(),
        verification_url: `https://flexyfac.upc.ac.cd/verify-bon/${data.bonId}`
      }), { width: 150, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } });

      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a365d')
         .text('UNIVERSITE PROTESTANTE AU CONGO', 40, 30)
         .text('SECRETARIAT ACADEMIQUE GENERAL', 40, doc.y + 2)
         .text('APPARITORAT CENTRAL', 40, doc.y + 2);
      if (logoBuffer) doc.image(logoBuffer, 700, 20, { width: 80 });
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#c53030')
         .text('BILLET DE PAIEMENT', 0, 28, { align: 'center' })
         .moveDown(1);

      const topY = doc.y;
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000')
         .text(`Bon N°: ${data.bonId}`, 40, topY);
      doc.font('Helvetica').text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 40, topY + 18);
      const dateExpiration = new Date(); dateExpiration.setDate(dateExpiration.getDate() + 30);
      doc.text(`Date d'expiration: ${dateExpiration.toLocaleDateString('fr-FR')}`, 40, topY + 36);
      doc.image(qrCodeBuffer, 650, topY - 10, { width: 120 });
      doc.fontSize(10).text('Code de vérification', 650, topY + 110, { width: 120, align: 'center' });

      const colWidth = 340;
      const gap = 40;
      const colLeftX = 40;
      const colRightX = colLeftX + colWidth + gap;
      const colTop = topY + 140;

      doc.fontSize(16).font('Helvetica-Bold').fillColor('#2d3748')
         .text('INFORMATIONS ÉTUDIANT', colLeftX, colTop, { underline: true });
      doc.rect(colLeftX, colTop + 18, colWidth, 110).stroke('#cccccc');
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000')
         .text('Nom complet:', colLeftX + 10, colTop + 32);
      doc.font('Helvetica').text(`${data.etudiant.prenom} ${data.etudiant.nom}`, colLeftX + 110, colTop + 32, { width: colWidth - 120 });
      doc.font('Helvetica-Bold').text('Matricule:', colLeftX + 10, colTop + 52);
      doc.font('Helvetica').text(data.etudiant.matricule, colLeftX + 110, colTop + 52);
      doc.font('Helvetica-Bold').text('Faculté:', colLeftX + 10, colTop + 72);
      doc.font('Helvetica').text(data.etudiant.faculte, colLeftX + 110, colTop + 72);
      doc.font('Helvetica-Bold').text('Email:', colLeftX + 10, colTop + 92);
      doc.font('Helvetica').text(data.etudiant.email, colLeftX + 110, colTop + 92, { width: colWidth - 120 });

      doc.fontSize(16).font('Helvetica-Bold').fillColor('#2d3748')
         .text('DÉTAILS DU PAIEMENT', colRightX, colTop, { underline: true });
      doc.rect(colRightX, colTop + 18, colWidth, 160).stroke('#cccccc');
      const totalFrais = data.typeFrais.nom.toLowerCase().includes('acad') ? data.typeFrais.montant_usd : data.montant_usd;
      const montantPaye = data.montant_usd;
      const restant = Math.max(0, totalFrais - montantPaye);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000')
         .text('Type de frais:', colRightX + 10, colTop + 32);
      doc.font('Helvetica').text(data.typeFrais.nom, colRightX + 120, colTop + 32, { width: colWidth - 140 });
      doc.font('Helvetica-Bold').text('Description:', colRightX + 10, colTop + 52);
      doc.font('Helvetica').text(data.typeFrais.description || 'N/A', colRightX + 120, colTop + 52, { width: colWidth - 140 });
      doc.font('Helvetica-Bold').text('Montant total USD:', colRightX + 10, colTop + 72);
      doc.font('Helvetica').fontSize(13).fillColor('#000')
         .text(`$${totalFrais}`, colRightX + 150, colTop + 72);
      doc.font('Helvetica-Bold').fillColor('#000').fontSize(12)
         .text('Montant payé USD:', colRightX + 10, colTop + 92);
      doc.font('Helvetica').fontSize(14).fillColor('#c53030')
         .text(`$${montantPaye}`, colRightX + 150, colTop + 90);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#000')
         .text('Reste à payer USD:', colRightX + 10, colTop + 112);
      doc.font('Helvetica').fontSize(14).fillColor(restant > 0 ? '#d97706' : '#16a34a')
         .text(`$${restant}`, colRightX + 150, colTop + 110);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000')
         .text('Montant CDF:', colRightX + 10, colTop + 134);
      doc.font('Helvetica').fontSize(14).fillColor('#c53030')
         .text(`${data.montantCdf.toLocaleString('fr-CD')} FC`, colRightX + 150, colTop + 132);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000')
         .text('Taux de change:', colRightX + 10, colTop + 154);
      doc.font('Helvetica').text(`1 USD = ${data.tauxChange} CDF`, colRightX + 150, colTop + 154);

      doc.fontSize(8).font('Helvetica').fillColor('#666666')
         .text('Ce document est généré automatiquement par le système FlexyFac', 0, 420, { align: 'center' })
         .text(`Généré le ${new Date().toLocaleString('fr-FR')} - ID: ${data.paiementId}`, { align: 'center' })
         .text("Pour toute question, contactez l'administration: admin@upc.ac.cd", { align: 'center' });

      doc.end();
      doc.on('end', () => resolve(data.filePath));
      doc.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

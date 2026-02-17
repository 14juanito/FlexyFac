const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { getDb } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Générer un reçu PDF avec QR Code
exports.genererRecuPDF = async (req, res) => {
  try {
    const { paiementId } = req.params;
    
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Récupérer les informations du paiement
    const paiement = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.matricule, e.faculte, tf.nom as type_frais_nom
      FROM Paiements p
      JOIN Etudiants e ON p.etudiant_id = e.id
      JOIN TypesFrais tf ON p.type_frais_id = tf.id
      WHERE p.id = ?
    `).get(paiementId);

    if (!paiement) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    if (paiement.statut !== 'VALIDE') {
      return res.status(400).json({ error: 'Le paiement doit être validé pour générer un reçu' });
    }

    // Générer le QR Code avec les informations de vérification
    const qrData = {
      id: paiement.id,
      matricule: paiement.matricule,
      montant: paiement.montant_usd,
      date: paiement.date_paiement,
      verification: `https://flexyfac.upc.ac.cd/verify/${paiement.id}`
    };
    
    const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
      width: 150,
      margin: 2
    });

    // Créer le PDF
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `recu_${paiement.id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    
    doc.pipe(fs.createWriteStream(filePath));

    // En-tête
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('UNIVERSITÉ PROTESTANTE DU CONGO', { align: 'center' });
    
    doc.fontSize(16)
       .text('REÇU DE PAIEMENT', { align: 'center' })
       .moveDown(2);

    // Informations étudiant
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('INFORMATIONS ÉTUDIANT', { underline: true })
       .moveDown(0.5);
    
    doc.font('Helvetica')
       .text(`Nom complet: ${paiement.prenom} ${paiement.nom}`)
       .text(`Matricule: ${paiement.matricule}`)
       .text(`Faculté: ${paiement.faculte}`)
       .moveDown(1);

    // Informations paiement
    doc.font('Helvetica-Bold')
       .text('DÉTAILS DU PAIEMENT', { underline: true })
       .moveDown(0.5);
    
    doc.font('Helvetica')
       .text(`Type de frais: ${paiement.type_frais_nom}`)
       .text(`Montant: $${paiement.montant_usd} USD (${paiement.montant_cdf.toLocaleString()} CDF)`)
       .text(`Mode de paiement: ${paiement.mode_paiement}`)
       .text(`Date de paiement: ${new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}`)
       .text(`Référence: ${paiement.transaction_id || paiement.bon_id || paiement.id}`)
       .moveDown(1);

    // QR Code
    doc.font('Helvetica-Bold')
       .text('CODE DE VÉRIFICATION', { underline: true })
       .moveDown(0.5);
    
    doc.image(qrCodeBuffer, doc.x, doc.y, { width: 100 });
    doc.moveDown(7);
    
    doc.font('Helvetica')
       .fontSize(10)
       .text('Scannez ce QR code pour vérifier l\'authenticité du reçu')
       .moveDown(2);

    // Pied de page
    doc.fontSize(8)
       .text('Ce reçu est généré automatiquement par le système FlexyFac', { align: 'center' })
       .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });

    doc.end();

    // Attendre que le PDF soit créé
    await new Promise((resolve) => {
      doc.on('end', resolve);
    });

    // Mettre à jour le paiement avec le chemin du PDF
    db.prepare('UPDATE Paiements SET notes = ? WHERE id = ?')
      .run(`PDF généré: ${fileName}`, paiementId);

    res.json({
      success: true,
      message: 'Reçu PDF généré avec succès',
      fileName,
      downloadUrl: `/api/pdf/download/${fileName}`
    });

  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
};

// Télécharger un PDF
exports.telechargerPDF = (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(uploadsDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Erreur téléchargement:', err);
        res.status(500).json({ error: 'Erreur lors du téléchargement' });
      }
    });
  } catch (error) {
    console.error('Erreur téléchargement PDF:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

// Vérifier un paiement via QR Code
exports.verifierPaiement = async (req, res) => {
  try {
    const { paiementId } = req.params;
    
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    const paiement = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.matricule, tf.nom as type_frais_nom
      FROM Paiements p
      JOIN Etudiants e ON p.etudiant_id = e.id
      JOIN TypesFrais tf ON p.type_frais_id = tf.id
      WHERE p.id = ?
    `).get(paiementId);

    if (!paiement) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Paiement non trouvé' 
      });
    }

    res.json({
      valid: true,
      paiement: {
        id: paiement.id,
        etudiant: `${paiement.prenom} ${paiement.nom}`,
        matricule: paiement.matricule,
        typeFrais: paiement.type_frais_nom,
        montant: paiement.montant_usd,
        statut: paiement.statut,
        datePaiement: paiement.date_paiement
      }
    });

  } catch (error) {
    console.error('Erreur vérification:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Erreur lors de la vérification' 
    });
  }
};
const db = require('../config/database');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Générer un bon de paiement
exports.genererBonPaiement = async (req, res) => {
  try {
    const { etudiant_id, type_frais_id } = req.body;

    // Récupérer les informations
    const etudiant = await db.get('SELECT * FROM Etudiants WHERE id = ?', [etudiant_id]);
    const typeFrais = await db.get('SELECT * FROM TypesFrais WHERE id = ?', [type_frais_id]);
    const tauxChange = await db.get('SELECT taux_usd_cdf FROM TauxChange WHERE actif = 1 ORDER BY date_maj DESC LIMIT 1');

    if (!etudiant || !typeFrais) {
      return res.status(404).json({ error: 'Étudiant ou type de frais introuvable' });
    }

    const taux = tauxChange?.taux_usd_cdf || 2650;
    const montantCDF = typeFrais.montant_usd * taux;
    const reference = `BON${Date.now()}`;

    // Enregistrer dans la base
    const result = await db.run(`
      INSERT INTO Paiements (etudiant_id, type_frais_id, montant_usd, montant_cdf, taux_change, 
                           statut, reference_transaction, mode_paiement, type_operation)
      VALUES (?, ?, ?, ?, ?, 'BON_GENERE', ?, 'Bon de Paiement', 'BON_PAIEMENT')
    `, [etudiant_id, type_frais_id, typeFrais.montant_usd, montantCDF, taux, reference]);

    // Générer le PDF du bon
    const pdfPath = await genererPDFBon({
      etudiant,
      typeFrais,
      montantUSD: typeFrais.montant_usd,
      montantCDF,
      taux,
      reference
    });

    // Mettre à jour avec le chemin du PDF
    await db.run('UPDATE Paiements SET bon_paiement_pdf = ? WHERE id = ?', [pdfPath, result.lastID]);

    res.json({
      success: true,
      message: 'Bon de paiement généré avec succès',
      reference,
      pdfPath,
      montantUSD: typeFrais.montant_usd,
      montantCDF
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la génération du bon' });
  }
};

// Simuler un paiement en ligne
exports.simulerPaiement = async (req, res) => {
  try {
    const { etudiant_id, type_frais_id, mode_paiement } = req.body;

    // Récupérer les informations
    const etudiant = await db.get('SELECT * FROM Etudiants WHERE id = ?', [etudiant_id]);
    const typeFrais = await db.get('SELECT * FROM TypesFrais WHERE id = ?', [type_frais_id]);
    const tauxChange = await db.get('SELECT taux_usd_cdf FROM TauxChange WHERE actif = 1 ORDER BY date_maj DESC LIMIT 1');

    if (!etudiant || !typeFrais) {
      return res.status(404).json({ error: 'Étudiant ou type de frais introuvable' });
    }

    const taux = tauxChange?.taux_usd_cdf || 2650;
    const montantCDF = typeFrais.montant_usd * taux;
    const reference = `TXN${Date.now()}`;

    // Simuler le succès du paiement (90% de chance)
    const success = Math.random() > 0.1;
    const statut = success ? 'SUCCES' : 'ECHEC';

    // Enregistrer le paiement
    const result = await db.run(`
      INSERT INTO Paiements (etudiant_id, type_frais_id, montant_usd, montant_cdf, taux_change,
                           statut, reference_transaction, mode_paiement, type_operation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PAIEMENT_LIGNE')
    `, [etudiant_id, type_frais_id, typeFrais.montant_usd, montantCDF, taux, statut, reference, mode_paiement]);

    if (success) {
      // Générer le reçu PDF
      const recuPath = await genererRecuPDF({
        etudiant,
        typeFrais,
        montantUSD: typeFrais.montant_usd,
        montantCDF,
        taux,
        reference,
        mode_paiement
      });

      await db.run('UPDATE Paiements SET recu_pdf = ? WHERE id = ?', [recuPath, result.lastID]);
    }

    res.json({
      success,
      message: success ? 'Paiement effectué avec succès' : 'Échec du paiement',
      reference,
      statut,
      montantUSD: typeFrais.montant_usd,
      montantCDF
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du paiement' });
  }
};

// Fonction utilitaire pour générer le PDF du bon
async function genererPDFBon(data) {
  const doc = new PDFDocument();
  const fileName = `bon_${data.reference}.pdf`;
  const filePath = path.join(__dirname, '../uploads', fileName);

  // Créer le dossier s'il n'existe pas
  const uploadsDir = path.dirname(filePath);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  doc.pipe(fs.createWriteStream(filePath));

  // Contenu du bon
  doc.fontSize(20).text('BON DE PAIEMENT - UPC', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Référence: ${data.reference}`);
  doc.text(`Étudiant: ${data.etudiant.prenom} ${data.etudiant.nom}`);
  doc.text(`Matricule: ${data.etudiant.matricule}`);
  doc.text(`Type de frais: ${data.typeFrais.nom}`);
  doc.text(`Montant: $${data.montantUSD} USD (${data.montantCDF.toLocaleString()} CDF)`);
  doc.text(`Taux: 1 USD = ${data.taux} CDF`);
  doc.moveDown();
  doc.text('Présentez ce bon à la caisse pour effectuer le paiement.');

  doc.end();
  return fileName;
}

// Fonction utilitaire pour générer le reçu PDF
async function genererRecuPDF(data) {
  const doc = new PDFDocument();
  const fileName = `recu_${data.reference}.pdf`;
  const filePath = path.join(__dirname, '../uploads', fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Contenu du reçu
  doc.fontSize(20).text('REÇU DE PAIEMENT - UPC', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Référence: ${data.reference}`);
  doc.text(`Étudiant: ${data.etudiant.prenom} ${data.etudiant.nom}`);
  doc.text(`Matricule: ${data.etudiant.matricule}`);
  doc.text(`Type de frais: ${data.typeFrais.nom}`);
  doc.text(`Montant payé: $${data.montantUSD} USD (${data.montantCDF.toLocaleString()} CDF)`);
  doc.text(`Mode de paiement: ${data.mode_paiement}`);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`);

  doc.end();
  return fileName;
}

module.exports = exports;
const db = require('../config/database');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

exports.payerEnLigne = async (req, res) => {
  res.status(400).json({ error: 'Paiement en ligne désactivé. Utilisez le bon de paiement.' });
};

exports.genererBon = async (req, res) => {
  // conservé pour compat mais non utilisé ici
  res.status(400).json({ error: 'Utilisez /api/pdf-bon/generer pour créer un bon.' });
};

exports.getHistoriquePaiements = async (req, res) => {
  try {
    const { etudiant_id } = req.params;
    const [paiements] = await db.query(`
      SELECT p.*, tf.nom as type_frais_nom, tf.description 
      FROM Paiements p 
      JOIN TypesFrais tf ON p.type_frais_id = tf.id 
      WHERE p.etudiant_id = ? 
      ORDER BY p.date_paiement DESC
    `, [etudiant_id]);
    res.json({ success: true, paiements });
  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
};

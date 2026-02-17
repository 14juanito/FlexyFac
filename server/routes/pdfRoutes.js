const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// POST /api/pdf/recu/:paiementId - Générer un reçu PDF avec QR Code
router.post('/recu/:paiementId', pdfController.genererRecuPDF);

// GET /api/pdf/download/:fileName - Télécharger un PDF
router.get('/download/:fileName', pdfController.telechargerPDF);

// GET /api/pdf/verify/:paiementId - Vérifier un paiement via QR Code
router.get('/verify/:paiementId', pdfController.verifierPaiement);

module.exports = router;
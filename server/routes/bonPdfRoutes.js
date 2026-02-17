const express = require('express');
const router = express.Router();
const bonPdfController = require('../controllers/bonPdfController');

// POST /api/pdf-bon/generer - Générer un bon de paiement PDF
router.post('/generer', bonPdfController.genererBonPDF);

// GET /api/pdf-bon/download/:fileName - Télécharger un bon PDF
router.get('/download/:fileName', bonPdfController.telechargerBonPDF);

// GET /api/pdf-bon/etudiant/:etudiant_id - Lister tous les bons d'un étudiant
router.get('/etudiant/:etudiant_id', bonPdfController.listerBonsEtudiant);

module.exports = router;
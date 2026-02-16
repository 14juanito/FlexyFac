const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');

// POST /api/paiements/bon - Générer un bon de paiement
router.post('/bon', paiementController.genererBonPaiement);

// POST /api/paiements/simuler - Simuler un paiement en ligne
router.post('/simuler', paiementController.simulerPaiement);

module.exports = router;
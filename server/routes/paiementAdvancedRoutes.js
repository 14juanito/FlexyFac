const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementAdvancedController');

// Route pour paiement en ligne
router.post('/payer-en-ligne', paiementController.payerEnLigne);

// Route pour générer bon de paiement PDF
router.post('/generer-bon', paiementController.genererBon);

// Route pour historique des paiements
router.get('/historique/:etudiant_id', paiementController.getHistoriquePaiements);

module.exports = router;
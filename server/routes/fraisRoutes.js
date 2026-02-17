const express = require('express');
const router = express.Router();
const fraisController = require('../controllers/fraisController');

// GET /api/frais/:matricule - Calculer les frais pour un étudiant
router.get('/:matricule', fraisController.calculerFrais);

// POST /api/frais/paiement - Effectuer un paiement
router.post('/paiement', fraisController.effectuerPaiement);

// POST /api/frais/bon - Générer un bon de paiement
router.post('/bon', fraisController.genererBon);

// GET /api/frais/historique/:etudiant_id - Obtenir l'historique des paiements
router.get('/historique/:etudiant_id', fraisController.obtenirHistorique);

// PUT /api/frais/valider-bon/:bonId - Valider un bon de paiement (admin)
router.put('/valider-bon/:bonId', fraisController.validerBon);

module.exports = router;

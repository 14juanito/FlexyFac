const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Authentification admin
router.post('/login', adminController.loginAdmin);

// Gestion des frais
router.get('/frais', adminController.getAllFrais);
router.put('/frais/:id', adminController.updateFrais);
router.post('/frais', adminController.addFrais);

// Gestion du taux de change
router.get('/taux-change', adminController.getTauxChange);
router.put('/taux-change', adminController.updateTauxChange);

// Statistiques
router.get('/stats', adminController.getStats);

module.exports = router;
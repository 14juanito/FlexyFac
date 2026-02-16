const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login - Connexion par matricule
router.post('/login', authController.login);

// GET /api/auth/check-matricule/:matricule - Vérification et récupération des frais
router.get('/check-matricule/:matricule', authController.checkMatricule);

module.exports = router;

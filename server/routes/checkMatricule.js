// Route /api/check-matricule
const express = require('express');
const router = express.Router();
const { checkMatriculeController } = require('../controllers/checkMatriculeController');

// POST : Vérifie le matricule, renvoie faculté et frais
router.post('/', checkMatriculeController);

module.exports = router;

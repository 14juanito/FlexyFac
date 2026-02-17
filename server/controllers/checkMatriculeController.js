const { getDb } = require('../config/database');
const extractFaculte = require('../utils/extractFaculte');

exports.checkMatriculeController = async (req, res) => {
  try {
    const { matricule } = req.body;
    if (!matricule) {
      return res.status(400).json({ error: 'Matricule requis.' });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Recherche étudiant
    const etudiant = db.prepare('SELECT * FROM Etudiants WHERE matricule = ?').get(matricule);
    if (!etudiant) {
      return res.status(404).json({ error: 'Matricule non trouvé.' });
    }

    // Extraction faculté
    const faculte = extractFaculte(matricule);
    if (!faculte) {
      return res.status(400).json({ error: 'Faculté inconnue.' });
    }

    // Recherche frais associés
    const frais = db.prepare('SELECT * FROM TypesFrais WHERE faculte = ? AND actif = 1').all(faculte);
    
    res.json({
      etudiant,
      faculte,
      frais
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

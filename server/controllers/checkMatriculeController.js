const db = require('../config/database');
const extractFaculte = require('../utils/extractFaculte');

exports.checkMatriculeController = async (req, res) => {
  try {
    const { matricule } = req.body;
    if (!matricule) {
      return res.status(400).json({ error: 'Matricule requis.' });
    }

    // Recherche étudiant
    const [etudiants] = await db.query('SELECT * FROM Etudiants WHERE matricule = ?', [matricule]);
    if (etudiants.length === 0) {
      return res.status(404).json({ error: 'Matricule non trouvé.' });
    }

    // Extraction faculté
    const faculte = extractFaculte(matricule);
    if (!faculte) {
      return res.status(400).json({ error: 'Faculté inconnue.' });
    }

    // Recherche frais associés
    const [frais] = await db.query('SELECT * FROM TypesFrais WHERE faculte = ? AND actif = 1', [faculte]);
    if (frais.length === 0) {
      return res.status(404).json({ error: 'Aucun frais pour cette faculté.' });
    }

    res.json({
      etudiant: etudiants[0],
      faculte,
      frais
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

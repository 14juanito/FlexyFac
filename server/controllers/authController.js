const db = require('../config/database');
const { 
  extractFacultyFromMatricule, 
  extractPromotionYear,
  validateMatriculeFormat 
} = require('../utils/facultyExtractor');

/**
 * Connexion d'un étudiant par matricule uniquement
 * Route: POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { matricule } = req.body;

    // Validation du matricule
    if (!matricule) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le matricule est requis' 
      });
    }

    if (!validateMatriculeFormat(matricule)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format de matricule invalide' 
      });
    }

    // Recherche de l'étudiant en base de données
    const [rows] = await db.query(
      'SELECT id, matricule, nom, prenom, email, date_naissance FROM Etudiants WHERE matricule = ?',
      [matricule]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Matricule non trouvé' 
      });
    }

    const etudiant = rows[0];

    // Extraction intelligente de la faculté et promotion
    const faculte = extractFacultyFromMatricule(matricule);
    const promotion = extractPromotionYear(matricule);

    // Réponse avec les informations de l'étudiant
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        id: etudiant.id,
        matricule: etudiant.matricule,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email,
        faculte,
        promotion,
        date_naissance: etudiant.date_naissance
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la connexion' 
    });
  }
};

/**
 * Vérification d'un matricule et récupération des frais associés
 * Route: GET /api/auth/check-matricule/:matricule
 */
exports.checkMatricule = async (req, res) => {
  try {
    const { matricule } = req.params;

    // Validation du format
    if (!validateMatriculeFormat(matricule)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format de matricule invalide' 
      });
    }

    // Vérification de l'existence en BDD
    const [etudiantRows] = await db.query(
      'SELECT id, matricule, nom, prenom, email FROM Etudiants WHERE matricule = ?',
      [matricule]
    );

    if (etudiantRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Matricule non trouvé' 
      });
    }

    const etudiant = etudiantRows[0];
    const faculte = extractFacultyFromMatricule(matricule);

    if (!faculte) {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de déterminer la faculté' 
      });
    }

    // Récupération des frais associés à la faculté
    const [fraisRows] = await db.query(
      'SELECT id, faculte, montant, description FROM Frais WHERE faculte = ?',
      [faculte]
    );

    res.json({
      success: true,
      data: {
        etudiant: {
          id: etudiant.id,
          matricule: etudiant.matricule,
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          email: etudiant.email
        },
        faculte,
        frais: fraisRows
      }
    });

  } catch (error) {
    console.error('Erreur check-matricule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification' 
    });
  }
};

const bcrypt = require('bcrypt');
const db = require('../config/database');

// Inscription d'un nouvel étudiant
exports.register = async (req, res) => {
  try {
    const { matricule, nom, prenom, email, mot_de_passe, promotion } = req.body;
    
    // Vérifier si l'étudiant existe déjà
    const existingStudent = await db.get('SELECT * FROM Etudiants WHERE matricule = ? OR email = ?', [matricule, email]);
    if (existingStudent) {
      return res.status(400).json({ error: 'Matricule ou email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Insérer le nouvel étudiant
    const result = await db.run(
      'INSERT INTO Etudiants (matricule, nom, prenom, email, mot_de_passe, promotion) VALUES (?, ?, ?, ?, ?, ?)',
      [matricule, nom, prenom, email, hashedPassword, promotion]
    );

    res.status(201).json({ 
      message: 'Compte créé avec succès',
      etudiant: { id: result.lastID, matricule, nom, prenom, email, promotion }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
};

// Connexion avec matricule seulement (authentification simplifiée)
exports.login = async (req, res) => {
  try {
    const { matricule } = req.body;

    if (!matricule) {
      return res.status(400).json({ error: 'Matricule requis' });
    }

    // Récupérer l'étudiant
    const [etudiantResult] = await db.query('SELECT * FROM Etudiants WHERE matricule = ?', [matricule]);
    if (!etudiantResult || etudiantResult.length === 0) {
      return res.status(404).json({ error: 'Matricule non trouvé' });
    }

    const studentData = etudiantResult[0];

    // Extraire la faculté du matricule
    const faculteCode = matricule.substring(0, 2);
    const faculteMap = {
      'SI': 'Sciences Informatiques',
      'DR': 'Droit', 
      'MD': 'Médecine',
      'GC': 'Génie Civil',
      'EC': 'Économie'
    };
    const faculte = faculteMap[faculteCode] || 'Inconnue';

    // Récupérer les types de frais pour cette faculté
    const [typesFraisResult] = await db.query('SELECT * FROM TypesFrais WHERE faculte = ? AND actif = 1', [faculte]);
    const typesFrais = typesFraisResult || [];

    // Récupérer le taux de change actuel
    const [tauxChangeResult] = await db.query('SELECT taux_usd_cdf FROM TauxChange WHERE actif = 1 ORDER BY date_maj DESC LIMIT 1');
    const tauxChange = tauxChangeResult?.[0];

    res.json({
      success: true,
      etudiant: {
        id: studentData.id,
        matricule: studentData.matricule,
        nom: studentData.nom,
        prenom: studentData.prenom,
        email: studentData.email,
        promotion: studentData.promotion,
        faculte
      },
      typesFrais,
      tauxChange: tauxChange?.taux_usd_cdf || 2650
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};
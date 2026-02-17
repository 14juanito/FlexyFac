const bcrypt = require('bcrypt');
const { getDb } = require('../config/database');

// Inscription d'un nouvel étudiant
exports.register = async (req, res) => {
  try {
    const { nom, prenom, matricule, email, password } = req.body;

    if (!nom || !prenom || !matricule || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Vérifier si l'étudiant existe déjà
    const existingStudent = db.prepare('SELECT id FROM Etudiants WHERE matricule = ? OR email = ?').get(matricule, email);
    if (existingStudent) {
      return res.status(409).json({ error: 'Matricule ou email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

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

    // Insérer le nouvel étudiant
    const result = db.prepare(`
      INSERT INTO Etudiants (nom, prenom, matricule, email, password, faculte)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nom, prenom, matricule, email, hashedPassword, faculte);

    res.status(201).json({
      success: true,
      message: 'Étudiant inscrit avec succès',
      etudiant: {
        id: result.lastInsertRowid,
        matricule,
        nom,
        prenom,
        email,
        faculte
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

// Connexion avec matricule seulement (authentification simplifiée)
exports.login = async (req, res) => {
  try {
    const { matricule } = req.body;

    if (!matricule) {
      return res.status(400).json({ error: 'Matricule requis' });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Récupérer l'étudiant
    const stmt = db.prepare('SELECT * FROM Etudiants WHERE matricule = ?');
    const studentData = stmt.get(matricule);
    if (!studentData) {
      return res.status(404).json({ error: 'Matricule non trouvé' });
    }

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
    const typesFrais = db.prepare('SELECT * FROM TypesFrais WHERE faculte = ? AND actif = 1').all(faculte);

    // Récupérer le taux de change actuel
    let tauxChange = 2850;
    try {
      const tauxResult = db.prepare('SELECT valeur FROM Config WHERE cle = ? AND actif = 1').get('taux_usd_cdf');
      tauxChange = tauxResult ? parseFloat(tauxResult.valeur) : 2850;
    } catch (e) {
      // Table Config n'existe pas encore
    }

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
      tauxChange
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};
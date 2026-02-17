const { getDb } = require('../config/database');

// Authentification admin simple
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
      res.json({
        success: true,
        admin: { username: 'admin', role: 'super_admin' }
      });
    } else {
      res.status(401).json({ error: 'Identifiants incorrects' });
    }
  } catch (error) {
    console.error('Erreur loginAdmin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer tous les frais par faculté
exports.getAllFrais = async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }
    
    const frais = db.prepare('SELECT * FROM TypesFrais ORDER BY faculte, nom').all();
    res.json({ success: true, frais });
  } catch (error) {
    console.error('Erreur getAllFrais:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des frais' });
  }
};

// Mettre à jour un frais
exports.updateFrais = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, montant_usd } = req.body;

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }
    
    db.prepare('UPDATE TypesFrais SET nom = ?, description = ?, montant_usd = ? WHERE id = ?')
      .run(nom, description, montant_usd, id);

    res.json({ success: true, message: 'Frais mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur updateFrais:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Ajouter un nouveau frais
exports.addFrais = async (req, res) => {
  try {
    const { faculte, nom, description, montant_usd } = req.body;

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }
    
    const result = db.prepare('INSERT INTO TypesFrais (faculte, nom, description, montant_usd) VALUES (?, ?, ?, ?)')
      .run(faculte, nom, description, montant_usd);

    res.json({ 
      success: true, 
      message: 'Frais ajouté avec succès',
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Erreur addFrais:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout' });
  }
};

// Récupérer le taux de change actuel
exports.getTauxChange = async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.json({ success: true, taux_usd_cdf: 2850 });
    }
    
    const result = db.prepare('SELECT valeur FROM Config WHERE cle = ? AND actif = 1')
      .get('taux_usd_cdf');

    const taux = result?.valeur || '2850';
    res.json({ success: true, taux_usd_cdf: parseFloat(taux) });
  } catch (error) {
    console.error('Erreur getTauxChange:', error);
    res.json({ success: true, taux_usd_cdf: 2850 });
  }
};

// Mettre à jour le taux de change
exports.updateTauxChange = async (req, res) => {
  try {
    const { nouveau_taux } = req.body;

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }
    
    db.prepare('UPDATE Config SET valeur = ?, date_maj = CURRENT_TIMESTAMP WHERE cle = ?')
      .run(nouveau_taux.toString(), 'taux_usd_cdf');

    res.json({ 
      success: true, 
      message: 'Taux de change mis à jour avec succès',
      nouveau_taux 
    });
  } catch (error) {
    console.error('Erreur updateTauxChange:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du taux' });
  }
};

// Statistiques rapides
exports.getStats = async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.json({
        success: true,
        stats: { total_etudiants: 0, total_frais: 0, total_paiements: 0 }
      });
    }
    
    const totalEtudiants = db.prepare('SELECT COUNT(*) as count FROM Etudiants').get();
    const totalFrais = db.prepare('SELECT COUNT(*) as count FROM TypesFrais WHERE actif = 1').get();
    
    let totalPaiements = { count: 0 };
    try {
      totalPaiements = db.prepare('SELECT COUNT(*) as count FROM Paiements').get();
    } catch (e) {
      // Table Paiements n'existe pas encore
    }

    res.json({
      success: true,
      stats: {
        total_etudiants: totalEtudiants?.count || 0,
        total_frais: totalFrais?.count || 0,
        total_paiements: totalPaiements?.count || 0
      }
    });
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.json({
      success: true,
      stats: { total_etudiants: 0, total_frais: 0, total_paiements: 0 }
    });
  }
};
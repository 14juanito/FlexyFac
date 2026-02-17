const { getDb } = require('../config/database');

// Calculer les frais pour un étudiant avec logique avancée
exports.calculerFrais = async (req, res) => {
  try {
    const { matricule } = req.params;
    
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Récupérer l'étudiant
    const etudiant = db.prepare('SELECT * FROM Etudiants WHERE matricule = ?').get(matricule);
    if (!etudiant) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }

    // Récupérer les types de frais pour sa faculté
    const typesFrais = db.prepare('SELECT * FROM TypesFrais WHERE faculte = ? AND actif = 1').all(etudiant.faculte);
    
    // Récupérer le taux de change actuel
    const tauxResult = db.prepare('SELECT valeur FROM Config WHERE cle = ? AND actif = 1').get('taux_usd_cdf');
    const tauxChange = tauxResult ? parseFloat(tauxResult.valeur) : 2850;

    // Récupérer les paiements déjà effectués
    const paiementsEffectues = db.prepare(`
      SELECT type_frais_id, SUM(montant_usd) as total_paye
      FROM Paiements 
      WHERE etudiant_id = ? AND statut = 'VALIDE'
      GROUP BY type_frais_id
    `).all(etudiant.id);

    const paiementsMap = new Map();
    paiementsEffectues.forEach(p => {
      paiementsMap.set(p.type_frais_id, p.total_paye);
    });

    // Calculer les frais avec statut de paiement
    const fraisAvecStatut = typesFrais.map(frais => {
      const totalPaye = paiementsMap.get(frais.id) || 0;
      const restant = Math.max(0, frais.montant_usd - totalPaye);
      
      return {
        ...frais,
        montant_cdf: Math.round(frais.montant_usd * tauxChange),
        total_paye: totalPaye,
        montant_restant: restant,
        montant_restant_cdf: Math.round(restant * tauxChange),
        statut_paiement: restant === 0 ? 'PAYE' : totalPaye > 0 ? 'PARTIEL' : 'NON_PAYE'
      };
    });

    // Récupérer l'historique complet des paiements
    const historique = db.prepare(`
      SELECT p.*, tf.nom as type_frais_nom 
      FROM Paiements p 
      JOIN TypesFrais tf ON p.type_frais_id = tf.id 
      WHERE p.etudiant_id = ? 
      ORDER BY p.date_paiement DESC
    `).all(etudiant.id);

    // Statistiques
    const totalFrais = typesFrais.reduce((sum, frais) => sum + frais.montant_usd, 0);
    const totalPaye = paiementsEffectues.reduce((sum, p) => sum + p.total_paye, 0);
    const totalRestant = totalFrais - totalPaye;

    res.json({
      success: true,
      etudiant: {
        id: etudiant.id,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        matricule: etudiant.matricule,
        faculte: etudiant.faculte,
        email: etudiant.email,
        promotion: etudiant.promotion
      },
      frais: fraisAvecStatut,
      historique,
      statistiques: {
        totalFrais,
        totalPaye,
        totalRestant,
        totalRestantCdf: Math.round(totalRestant * tauxChange),
        pourcentagePaye: totalFrais > 0 ? Math.round((totalPaye / totalFrais) * 100) : 0
      },
      tauxChange
    });

  } catch (error) {
    console.error('Erreur calcul frais:', error);
    res.status(500).json({ error: 'Erreur lors du calcul des frais' });
  }
};

// Effectuer un paiement avancé avec validation complète
exports.effectuerPaiement = async (req, res) => {
  try {
    const { etudiant_id, type_frais_id, montant_usd, mode_paiement, phone } = req.body;

    if (!etudiant_id || !type_frais_id || !montant_usd || !mode_paiement) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Pour le mobile money, on exige un numéro
    if (mode_paiement === 'MOBILE_MONEY' && (!phone || `${phone}`.trim().length < 9)) {
      return res.status(400).json({ error: 'Numéro mobile requis pour le paiement Mobile Money' });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Vérifier que l'étudiant et le type de frais existent
    const etudiant = db.prepare('SELECT * FROM Etudiants WHERE id = ?').get(etudiant_id);
    const typeFrais = db.prepare('SELECT * FROM TypesFrais WHERE id = ?').get(type_frais_id);

    if (!etudiant || !typeFrais) {
      return res.status(404).json({ error: 'Étudiant ou type de frais introuvable' });
    }

    // Vérifier que l'étudiant appartient à la bonne faculté
    if (typeFrais.faculte !== etudiant.faculte) {
      return res.status(400).json({ 
        error: 'Ce type de frais ne correspond pas à votre faculté' 
      });
    }

    // Vérifier le montant (ne peut pas dépasser le montant du frais)
    if (montant_usd > typeFrais.montant_usd) {
      return res.status(400).json({ 
        error: `Le montant ne peut pas dépasser $${typeFrais.montant_usd}` 
      });
    }

    // Vérifier si le frais n'est pas déjà entièrement payé
    const totalPaye = db.prepare(`
      SELECT COALESCE(SUM(montant_usd), 0) as total
      FROM Paiements 
      WHERE etudiant_id = ? AND type_frais_id = ? AND statut = 'VALIDE'
    `).get(etudiant_id, type_frais_id);

    if (totalPaye.total >= typeFrais.montant_usd) {
      return res.status(400).json({ 
        error: 'Ce frais est déjà entièrement payé' 
      });
    }

    const montantRestant = typeFrais.montant_usd - totalPaye.total;
    if (montant_usd > montantRestant) {
      return res.status(400).json({ 
        error: `Montant trop élevé. Montant restant: $${montantRestant}` 
      });
    }

    // Récupérer le taux de change
    const tauxResult = db.prepare('SELECT valeur FROM Config WHERE cle = ? AND actif = 1').get('taux_usd_cdf');
    const tauxChange = tauxResult ? parseFloat(tauxResult.valeur) : 2850;
    const montantCdf = Math.round(montant_usd * tauxChange);

    // Générer un ID de transaction unique
    const transactionId = `${mode_paiement.substring(0,3).toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Appel agrégateur Labyrinthe pour Mobile Money (sandbox/production)
    let success = true;
    let statut = 'VALIDE';
    let aggResponse = null;

    if (mode_paiement === 'MOBILE_MONEY') {
      const gateway = process.env.LABY_GATEWAY_MOBILE || 'https://payment.labyrinthe-rdc.com/api/beta/mobile';
      const token = process.env.LABY_TOKEN || '';
      const simulate = process.env.LABY_SIMULATE === 'true';
      if (!token && !simulate) {
        return res.status(500).json({ error: 'Token Labyrinthe manquant côté serveur' });
      }

      const payload = {
        token,
        reference: transactionId,
        phone: `${phone}`,
        gateway
      };

      if (simulate) {
        // Mode simulation : on ne contacte pas l'agrégateur, on marque la transaction en attente
        aggResponse = { simulated: true, message: 'Simulation Mobile Money activée (LABY_SIMULATE=true)' };
        success = true;
        statut = 'EN_ATTENTE';
      } else {
        try {
          const aggRes = await fetch(gateway, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          aggResponse = await aggRes.json();
          const aggOk = aggResponse?.success === true || aggResponse?.array?.[0]?.success === true;
          success = aggOk;
          statut = aggOk ? 'EN_ATTENTE' : 'ECHEC'; // EN_ATTENTE en attendant la validation USSD
        } catch (err) {
          console.error('Erreur appel Labyrinthe:', err.message);
          success = false;
          statut = 'ECHEC';
          aggResponse = { error: err.message };
        }
      }
    }

    // Simulation pour les autres modes (si aucun agrégateur)
    if (mode_paiement !== 'MOBILE_MONEY') {
      let successRate = 0.9;
      if (mode_paiement === 'BON_PHYSIQUE') successRate = 1.0;
      if (mode_paiement === 'CARTE_BANCAIRE') successRate = 0.95;
      success = Math.random() < successRate;
      statut = success ? 'VALIDE' : 'ECHEC';
    }

    // Enregistrer le paiement
    const result = db.prepare(`
      INSERT INTO Paiements (etudiant_id, type_frais_id, montant_usd, montant_cdf, 
                           mode_paiement, statut, transaction_id, date_paiement, date_validation)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    `).run(
      etudiant_id, type_frais_id, montant_usd, montantCdf, 
                           mode_paiement, statut, transactionId, 
                           success ? new Date().toISOString() : null
    );

    // Calculer le nouveau statut du frais
    const nouveauTotal = totalPaye.total + (success ? montant_usd : 0);
    const statutFrais = nouveauTotal >= typeFrais.montant_usd ? 'COMPLET' : 'PARTIEL';

    res.json({
      success,
      message: success
        ? (mode_paiement === 'MOBILE_MONEY'
            ? 'Demande Mobile Money envoyée, validez le push USSD'
            : 'Paiement effectué avec succès')
        : aggResponse?.message || aggResponse?.error || 'Échec du paiement - Veuillez réessayer',
      paiement: {
        id: result.lastInsertRowid,
        transaction_id: transactionId,
        montant_usd,
        montant_cdf: montantCdf,
        statut,
        mode_paiement,
        date_paiement: new Date().toISOString()
      },
      frais: {
        nom: typeFrais.nom,
        montant_total: typeFrais.montant_usd,
        total_paye: nouveauTotal,
        montant_restant: Math.max(0, typeFrais.montant_usd - nouveauTotal),
        statut: statutFrais
      },
      agrégateur: aggResponse
    });

  } catch (error) {
    console.error('Erreur paiement:', error);
    res.status(500).json({ error: 'Erreur lors du paiement' });
  }
};

// Générer un bon de paiement physique avec validation
exports.genererBon = async (req, res) => {
  try {
    const { etudiant_id, type_frais_id, montant_usd } = req.body;

    if (!etudiant_id || !type_frais_id || !montant_usd) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Vérifier que l'étudiant et le type de frais existent
    const etudiant = db.prepare('SELECT * FROM Etudiants WHERE id = ?').get(etudiant_id);
    const typeFrais = db.prepare('SELECT * FROM TypesFrais WHERE id = ?').get(type_frais_id);

    if (!etudiant || !typeFrais) {
      return res.status(404).json({ error: 'Étudiant ou type de frais introuvable' });
    }

    // Vérifications de validation
    if (typeFrais.faculte !== etudiant.faculte) {
      return res.status(400).json({ 
        error: 'Ce type de frais ne correspond pas à votre faculté' 
      });
    }

    if (montant_usd > typeFrais.montant_usd) {
      return res.status(400).json({ 
        error: `Le montant ne peut pas dépasser $${typeFrais.montant_usd}` 
      });
    }

    // Vérifier les paiements existants
    const totalPaye = db.prepare(`
      SELECT COALESCE(SUM(montant_usd), 0) as total
      FROM Paiements 
      WHERE etudiant_id = ? AND type_frais_id = ? AND statut IN ('VALIDE', 'EN_ATTENTE')
    `).get(etudiant_id, type_frais_id);

    const montantRestant = typeFrais.montant_usd - totalPaye.total;
    if (montant_usd > montantRestant) {
      return res.status(400).json({ 
        error: `Montant trop élevé. Montant restant disponible: $${montantRestant}` 
      });
    }

    // Récupérer le taux de change
    const tauxResult = db.prepare('SELECT valeur FROM Config WHERE cle = ? AND actif = 1').get('taux_usd_cdf');
    const tauxChange = tauxResult ? parseFloat(tauxResult.valeur) : 2850;
    const montantCdf = Math.round(montant_usd * tauxChange);

    // Générer un ID de bon unique avec checksum
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const checksum = (timestamp % 1000).toString().padStart(3, '0');
    const bonId = `BON${checksum}${random}`;

    // Enregistrer le bon (statut EN_ATTENTE)
    const result = db.prepare(`
      INSERT INTO Paiements (etudiant_id, type_frais_id, montant_usd, montant_cdf,
                           mode_paiement, statut, bon_id, date_paiement, notes)
      VALUES (?, ?, ?, ?, 'BON_PHYSIQUE', 'EN_ATTENTE', ?, datetime('now'), ?)
    `).run(
      etudiant_id, type_frais_id, montant_usd, montantCdf, bonId,
      `Bon généré automatiquement - Valide 30 jours`
    );

    // Calculer la date d'expiration (30 jours)
    const dateExpiration = new Date();
    dateExpiration.setDate(dateExpiration.getDate() + 30);

    res.json({
      success: true,
      message: 'Bon de paiement généré avec succès',
      bon: {
        id: result.lastInsertRowid,
        bon_id: bonId,
        etudiant: {
          nom: `${etudiant.prenom} ${etudiant.nom}`,
          matricule: etudiant.matricule,
          faculte: etudiant.faculte
        },
        frais: {
          nom: typeFrais.nom,
          description: typeFrais.description
        },
        montant: {
          usd: montant_usd,
          cdf: montantCdf,
          taux: tauxChange
        },
        dates: {
          generation: new Date().toISOString(),
          expiration: dateExpiration.toISOString()
        },
        instructions: [
          'Présentez ce bon à la caisse de l\'université',
          'Munissez-vous de votre carte d\'étudiant',
          'Le bon expire dans 30 jours',
          'Conservez le reçu après paiement'
        ]
      }
    });

  } catch (error) {
    console.error('Erreur génération bon:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du bon' });
  }
};

// Obtenir l'historique détaillé des paiements d'un étudiant
exports.obtenirHistorique = async (req, res) => {
  try {
    const { etudiant_id } = req.params;
    const { page = 1, limit = 10, statut, type_frais } = req.query;

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Vérifier que l'étudiant existe
    const etudiant = db.prepare('SELECT * FROM Etudiants WHERE id = ?').get(etudiant_id);
    if (!etudiant) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }

    // Construire la requête avec filtres
    let whereClause = 'WHERE p.etudiant_id = ?';
    let params = [etudiant_id];

    if (statut) {
      whereClause += ' AND p.statut = ?';
      params.push(statut);
    }

    if (type_frais) {
      whereClause += ' AND p.type_frais_id = ?';
      params.push(type_frais);
    }

    // Récupérer l'historique avec pagination
    const offset = (page - 1) * limit;
    const historique = db.prepare(`
      SELECT p.*, tf.nom as type_frais_nom, tf.description as type_frais_description,
             tf.montant_usd as montant_frais_total
      FROM Paiements p
      JOIN TypesFrais tf ON p.type_frais_id = tf.id
      ${whereClause}
      ORDER BY p.date_paiement DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Compter le total pour la pagination
    const totalCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM Paiements p
      ${whereClause}
    `).get(...params);

    // Calculer les statistiques globales
    const statsGlobales = db.prepare(`
      SELECT 
        COUNT(*) as total_paiements,
        SUM(CASE WHEN statut = 'VALIDE' THEN montant_usd ELSE 0 END) as montant_total_usd,
        SUM(CASE WHEN statut = 'VALIDE' THEN montant_cdf ELSE 0 END) as montant_total_cdf,
        COUNT(CASE WHEN statut = 'VALIDE' THEN 1 END) as paiements_valides,
        COUNT(CASE WHEN statut = 'EN_ATTENTE' THEN 1 END) as paiements_en_attente,
        COUNT(CASE WHEN statut = 'ECHEC' THEN 1 END) as paiements_echec
      FROM Paiements
      WHERE etudiant_id = ?
    `).get(etudiant_id);

    // Statistiques par type de frais
    const statsParType = db.prepare(`
      SELECT 
        tf.nom as type_frais,
        tf.montant_usd as montant_requis,
        COALESCE(SUM(CASE WHEN p.statut = 'VALIDE' THEN p.montant_usd ELSE 0 END), 0) as montant_paye,
        COUNT(CASE WHEN p.statut = 'VALIDE' THEN 1 END) as nb_paiements
      FROM TypesFrais tf
      LEFT JOIN Paiements p ON tf.id = p.type_frais_id AND p.etudiant_id = ?
      WHERE tf.faculte = ? AND tf.actif = 1
      GROUP BY tf.id, tf.nom, tf.montant_usd
    `).all(etudiant_id, etudiant.faculte);

    res.json({
      success: true,
      etudiant: {
        id: etudiant.id,
        nom: `${etudiant.prenom} ${etudiant.nom}`,
        matricule: etudiant.matricule,
        faculte: etudiant.faculte
      },
      historique: historique.map(p => ({
        ...p,
        date_paiement: new Date(p.date_paiement).toISOString(),
        date_validation: p.date_validation ? new Date(p.date_validation).toISOString() : null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      },
      statistiques: {
        globales: statsGlobales,
        parType: statsParType.map(stat => ({
          ...stat,
          montant_restant: Math.max(0, stat.montant_requis - stat.montant_paye),
          pourcentage_paye: stat.montant_requis > 0 ? 
            Math.round((stat.montant_paye / stat.montant_requis) * 100) : 0,
          statut: stat.montant_paye >= stat.montant_requis ? 'COMPLET' : 
                 stat.montant_paye > 0 ? 'PARTIEL' : 'NON_PAYE'
        }))
      }
    });

  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
};

// Valider un bon de paiement (pour l'administration)
exports.validerBon = async (req, res) => {
  try {
    const { bonId } = req.params;
    const { valide, notes } = req.body;

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Base de données non disponible' });
    }

    // Récupérer le paiement avec le bon
    const paiement = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.matricule, tf.nom as type_frais_nom
      FROM Paiements p
      JOIN Etudiants e ON p.etudiant_id = e.id
      JOIN TypesFrais tf ON p.type_frais_id = tf.id
      WHERE p.bon_id = ? AND p.mode_paiement = 'BON_PHYSIQUE'
    `).get(bonId);

    if (!paiement) {
      return res.status(404).json({ error: 'Bon de paiement non trouvé' });
    }

    if (paiement.statut !== 'EN_ATTENTE') {
      return res.status(400).json({ 
        error: `Ce bon a déjà été traité (statut: ${paiement.statut})` 
      });
    }

    // Mettre à jour le statut
    const nouveauStatut = valide ? 'VALIDE' : 'ANNULE';
    const notesFinales = notes || (valide ? 'Bon validé par la caisse' : 'Bon annulé');

    db.prepare(`
      UPDATE Paiements 
      SET statut = ?, date_validation = datetime('now'), notes = ?
      WHERE id = ?
    `).run(nouveauStatut, notesFinales, paiement.id);

    res.json({
      success: true,
      message: valide ? 'Bon de paiement validé avec succès' : 'Bon de paiement annulé',
      paiement: {
        id: paiement.id,
        bon_id: bonId,
        etudiant: `${paiement.prenom} ${paiement.nom}`,
        matricule: paiement.matricule,
        type_frais: paiement.type_frais_nom,
        montant_usd: paiement.montant_usd,
        statut: nouveauStatut,
        date_validation: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur validation bon:', error);
    res.status(500).json({ error: 'Erreur lors de la validation du bon' });
  }
};

module.exports = exports;

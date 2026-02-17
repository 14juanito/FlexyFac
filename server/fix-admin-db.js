const { getDb } = require('./config/database');

async function fixAdminDatabase() {
  try {
    const db = getDb();
    
    console.log('🔧 Correction de la base de données pour l\'admin...');
    
    // Créer la table Config si elle n'existe pas
    db.exec(`
      CREATE TABLE IF NOT EXISTS Config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cle VARCHAR(100) UNIQUE NOT NULL,
        valeur TEXT NOT NULL,
        description TEXT,
        date_maj DATETIME DEFAULT CURRENT_TIMESTAMP,
        actif BOOLEAN DEFAULT 1
      );
    `);
    
    // Créer la table Paiements si elle n'existe pas
    db.exec(`
      CREATE TABLE IF NOT EXISTS Paiements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        etudiant_id INTEGER NOT NULL,
        type_frais_id INTEGER NOT NULL,
        montant_usd DECIMAL(10,2) NOT NULL,
        montant_cdf DECIMAL(15,2) NOT NULL,
        mode_paiement TEXT NOT NULL,
        statut TEXT DEFAULT 'EN_ATTENTE',
        transaction_id VARCHAR(100),
        bon_id VARCHAR(100),
        date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_validation DATETIME,
        notes TEXT
      );
    `);
    
    // Insérer la configuration du taux de change
    const stmt = db.prepare('INSERT OR REPLACE INTO Config (cle, valeur, description) VALUES (?, ?, ?)');
    stmt.run('taux_usd_cdf', '2850', 'Taux de change USD vers CDF');
    
    console.log('✅ Base de données corrigée!');
    console.log('📊 Tables créées: Config, Paiements');
    console.log('💱 Taux de change configuré: 1$ = 2850 CDF');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

if (require.main === module) {
  fixAdminDatabase();
}

module.exports = { fixAdminDatabase };
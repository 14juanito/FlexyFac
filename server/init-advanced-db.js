const { getDb } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function initAdvancedDatabase() {
  try {
    console.log('🔧 Initialisation de la base de données avancée...');
    
    const db = getDb();
    if (!db) {
      throw new Error('Impossible de se connecter à la base de données');
    }

    // Lire le schéma SQL
    const schemaPath = path.join(__dirname, 'schema-advanced.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Diviser le schéma en instructions individuelles
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Exécuter chaque instruction
    for (const statement of statements) {
      try {
        db.exec(statement);
      } catch (error) {
        // Ignorer les erreurs de tables déjà existantes
        if (!error.message.includes('already exists')) {
          console.warn('Avertissement SQL:', error.message);
        }
      }
    }

    console.log('✅ Base de données avancée initialisée avec succès');
    
    // Vérifier les données
    const etudiants = db.prepare('SELECT COUNT(*) as count FROM Etudiants').get();
    const typesFrais = db.prepare('SELECT COUNT(*) as count FROM TypesFrais').get();
    const config = db.prepare('SELECT COUNT(*) as count FROM Config').get();
    
    console.log(`📊 Données chargées:`);
    console.log(`   - ${etudiants.count} étudiants`);
    console.log(`   - ${typesFrais.count} types de frais`);
    console.log(`   - ${config.count} paramètres de configuration`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return false;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  const { initDatabase } = require('./config/database');
  
  (async () => {
    await initDatabase();
    await initAdvancedDatabase();
    process.exit(0);
  })();
}

module.exports = { initAdvancedDatabase };
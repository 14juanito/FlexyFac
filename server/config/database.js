const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'flexyfac.db');
let db = null;

// Initialisation de la base de données
const initDatabase = async () => {
  if (db) return db;
  
  try {
    db = new Database(dbPath);
    console.log('✅ Base de données SQLite connectée');
    
    // Activer les clés étrangères
    db.pragma('foreign_keys = ON');
    
    return db;
  } catch (error) {
    console.error('❌ Erreur connexion DB:', error);
    throw error;
  }
};

// Wrapper pour compatibilité avec l'ancien code
const pool = {
  query: async (sql, params = []) => {
    if (!db) await initDatabase();
    
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        const results = stmt.all(...params);
        return [results];
      } else {
        const stmt = db.prepare(sql);
        const result = stmt.run(...params);
        return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }];
      }
    } catch (error) {
      console.error('Erreur SQL:', error.message, '\nSQL:', sql);
      throw error;
    }
  }
};

module.exports = pool;
module.exports.initDatabase = initDatabase;
module.exports.getDb = () => db;

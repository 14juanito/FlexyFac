const Database = require('better-sqlite3');
const path = require('path');

// Création de la base de données SQLite
const dbPath = path.join(__dirname, '..', 'flexyfac.db');
const db = new Database(dbPath);

// Configuration pour de meilleures performances
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✅ Base de données SQLite connectée:', dbPath);

// Fonction helper pour exécuter des requêtes
const query = (sql, params = []) => {
  try {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return db.prepare(sql).all(params);
    } else {
      const result = db.prepare(sql).run(params);
      return { affectedRows: result.changes, insertId: result.lastInsertRowid };
    }
  } catch (error) {
    console.error('Erreur SQL:', error.message);
    throw error;
  }
};

// Wrapper pour compatibilité avec l'ancien code MySQL
const pool = {
  query: async (sql, params) => {
    return [query(sql, params)];
  }
};

module.exports = pool;
module.exports.db = db;
module.exports.query = query;

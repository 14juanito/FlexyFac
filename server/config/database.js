const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'flexyfac.db');
let db = null;
let SQL = null;

// Initialisation de la base de données
const initDatabase = async () => {
  if (db) return db;
  
  SQL = await initSqlJs();
  
  // Charger la base existante ou créer une nouvelle
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ Base de données SQLite chargée');
  } else {
    db = new SQL.Database();
    console.log('✅ Nouvelle base de données SQLite créée');
  }
  
  return db;
};

// Sauvegarder la base de données
const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// Wrapper pour compatibilité avec l'ancien code
const pool = {
  query: async (sql, params = []) => {
    if (!db) await initDatabase();
    
    try {
      const stmt = db.prepare(sql);
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      
      // Sauvegarder après chaque modification
      if (!sql.trim().toUpperCase().startsWith('SELECT')) {
        saveDatabase();
      }
      
      return [results];
    } catch (error) {
      console.error('Erreur SQL:', error.message, '\nSQL:', sql);
      throw error;
    }
  }
};

module.exports = pool;
module.exports.initDatabase = initDatabase;
module.exports.saveDatabase = saveDatabase;
module.exports.getDb = () => db;

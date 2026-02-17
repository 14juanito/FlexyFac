const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flexyfac.db');
const db = new Database(dbPath);

// Créer les tables
db.exec(`
-- Table des étudiants
CREATE TABLE IF NOT EXISTS Etudiants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(100) NOT NULL,
    postnom VARCHAR(100),
    prenom VARCHAR(100) NOT NULL,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    promotion VARCHAR(20),
    email VARCHAR(150) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL,
    faculte VARCHAR(100),
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT 1
);

-- Table des types de frais
CREATE TABLE IF NOT EXISTS TypesFrais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculte VARCHAR(100) NOT NULL,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    montant_usd DECIMAL(10,2) NOT NULL,
    actif BOOLEAN DEFAULT 1,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table de configuration
CREATE TABLE IF NOT EXISTS Config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT NOT NULL,
    description TEXT,
    date_maj DATETIME DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT 1
);

-- Table des paiements
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
    notes TEXT,
    FOREIGN KEY (etudiant_id) REFERENCES Etudiants(id),
    FOREIGN KEY (type_frais_id) REFERENCES TypesFrais(id)
);

-- Table admin
CREATE TABLE IF NOT EXISTS Admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    email VARCHAR(150),
    role VARCHAR(50) DEFAULT 'admin',
    actif BOOLEAN DEFAULT 1,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Insérer les données de base
const insertConfig = db.prepare(`INSERT OR REPLACE INTO Config (cle, valeur, description) VALUES (?, ?, ?)`);
insertConfig.run('taux_usd_cdf', '2850', 'Taux de change USD vers CDF');

const insertAdmin = db.prepare(`INSERT OR REPLACE INTO Admin (username, password, nom, email) VALUES (?, ?, ?, ?)`);
insertAdmin.run('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur', 'admin@flexyfac.com');

const insertTypeFrais = db.prepare(`INSERT OR REPLACE INTO TypesFrais (faculte, nom, description, montant_usd) VALUES (?, ?, ?, ?)`);
insertTypeFrais.run('Sciences Informatiques', 'Frais d\'inscription', 'Frais d\'inscription annuelle', 150.00);
insertTypeFrais.run('Droit', 'Frais d\'inscription', 'Frais d\'inscription annuelle', 120.00);
insertTypeFrais.run('Médecine', 'Frais d\'inscription', 'Frais d\'inscription annuelle', 200.00);

const insertEtudiant = db.prepare(`INSERT OR REPLACE INTO Etudiants (nom, prenom, matricule, email, password, faculte) VALUES (?, ?, ?, ?, ?, ?)`);
insertEtudiant.run('MUKENDI', 'Jean', 'SI2024001', 'jean@upc.ac.cd', '$2b$10$example', 'Sciences Informatiques');

console.log('✅ Base de données initialisée avec succès');
db.close();
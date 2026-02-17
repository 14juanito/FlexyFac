-- Schéma SQL FlexyFac - Version Avancée
-- Système intelligent de gestion des frais universitaires

-- Table des étudiants (avec inscription complète)
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

-- Table des types de frais par faculté
CREATE TABLE IF NOT EXISTS TypesFrais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculte VARCHAR(100) NOT NULL,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    montant_usd DECIMAL(10,2) NOT NULL,
    actif BOOLEAN DEFAULT 1,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table de configuration (taux de change et paramètres)
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
    mode_paiement TEXT CHECK(mode_paiement IN ('EN_LIGNE', 'BON_PHYSIQUE')) NOT NULL,
    statut TEXT CHECK(statut IN ('EN_ATTENTE', 'VALIDE', 'ECHEC', 'ANNULE')) DEFAULT 'EN_ATTENTE',
    transaction_id VARCHAR(100),
    bon_id VARCHAR(100),
    date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_validation DATETIME,
    notes TEXT,
    FOREIGN KEY (etudiant_id) REFERENCES Etudiants(id),
    FOREIGN KEY (type_frais_id) REFERENCES TypesFrais(id)
);

-- Table des sessions (pour JWT et sécurité)
CREATE TABLE IF NOT EXISTS Sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    etudiant_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_expiration DATETIME NOT NULL,
    actif BOOLEAN DEFAULT 1,
    FOREIGN KEY (etudiant_id) REFERENCES Etudiants(id)
);

-- Insertion des données de configuration initiales
INSERT OR REPLACE INTO Config (cle, valeur, description) VALUES 
('taux_usd_cdf', '2850', 'Taux de change USD vers CDF'),
('frais_actifs', '1', 'Activation du système de frais'),
('paiement_en_ligne_actif', '1', 'Activation des paiements en ligne'),
('bon_physique_actif', '1', 'Activation des bons de paiement physique');

-- Insertion des types de frais par faculté
INSERT OR REPLACE INTO TypesFrais (faculte, nom, description, montant_usd) VALUES 
-- Sciences Informatiques
('Sciences Informatiques', 'Frais d\'inscription', 'Frais d\'inscription annuelle', 150.00),
('Sciences Informatiques', 'Frais de laboratoire', 'Accès aux laboratoires informatiques', 80.00),
('Sciences Informatiques', 'Frais de projet', 'Encadrement projet de fin d\'études', 100.00),
('Sciences Informatiques', 'Frais de stage', 'Supervision et évaluation de stage', 60.00),

-- Droit
('Droit', 'Frais d\'inscription', 'Frais d\'inscription annuelle', 120.00),
('Droit', 'Frais de bibliothèque juridique', 'Accès à la bibliothèque spécialisée', 50.00),
('Droit', 'Frais de mémoire', 'Encadrement mémoire de fin d\'études', 90.00),
('Droit', 'Frais de stage professionnel', 'Stage en cabinet ou institution', 70.00),

-- Médecine
('Médecine', 'Frais d\'inscription', 'Frais d\'inscription annuelle', 200.00),
('Médecine', 'Frais de laboratoire médical', 'Accès aux laboratoires médicaux', 120.00),
('Médecine', 'Frais de stage hospitalier', 'Stage en milieu hospitalier', 150.00),
('Médecine', 'Frais de matériel médical', 'Fournitures et équipements', 80.00),

-- Génie Civil
('Génie Civil', 'Frais d\'inscription', 'Frais d\'inscription annuelle', 180.00),
('Génie Civil', 'Frais de laboratoire technique', 'Laboratoires de matériaux et structures', 100.00),
('Génie Civil', 'Frais de projet technique', 'Projet de fin d\'études', 120.00),
('Génie Civil', 'Frais de stage technique', 'Stage en entreprise de construction', 90.00),

-- Économie
('Économie', 'Frais d\'inscription', 'Frais d\'inscription annuelle', 130.00),
('Économie', 'Frais de recherche', 'Accès aux bases de données économiques', 60.00),
('Économie', 'Frais de mémoire', 'Encadrement mémoire de fin d\'études', 85.00),
('Économie', 'Frais de stage professionnel', 'Stage en entreprise ou institution', 65.00);

-- Insertion d'étudiants de test
INSERT OR REPLACE INTO Etudiants (nom, postnom, prenom, matricule, promotion, email, password, faculte) VALUES 
('MUKENDI', 'KALALA', 'Jean', 'SI2024001', '2024-2025', 'jean.mukendi@upc.ac.cd', '$2b$10$example_hash_1', 'Sciences Informatiques'),
('TSHIMANGA', 'MBUYI', 'Marie', 'DR2024002', '2024-2025', 'marie.tshimanga@upc.ac.cd', '$2b$10$example_hash_2', 'Droit'),
('KABONGO', 'NGOY', 'Pierre', 'MD2024003', '2024-2025', 'pierre.kabongo@upc.ac.cd', '$2b$10$example_hash_3', 'Médecine'),
('MWAMBA', 'KASONGO', 'Grace', 'GC2024004', '2024-2025', 'grace.mwamba@upc.ac.cd', '$2b$10$example_hash_4', 'Génie Civil'),
('ILUNGA', 'MUTOMBO', 'David', 'EC2024005', '2024-2025', 'david.ilunga@upc.ac.cd', '$2b$10$example_hash_5', 'Économie');

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_etudiants_matricule ON Etudiants(matricule);
CREATE INDEX IF NOT EXISTS idx_etudiants_email ON Etudiants(email);
CREATE INDEX IF NOT EXISTS idx_typefrais_faculte ON TypesFrais(faculte);
CREATE INDEX IF NOT EXISTS idx_paiements_etudiant ON Paiements(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_paiements_statut ON Paiements(statut);
CREATE INDEX IF NOT EXISTS idx_config_cle ON Config(cle);
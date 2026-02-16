-- FlexyFac - Schéma SQLite
-- Base de données pour la gestion intelligente des frais universitaires

-- Table Etudiants
CREATE TABLE IF NOT EXISTS Etudiants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricule TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mot_de_passe TEXT NOT NULL, -- Mot de passe hashé
  promotion TEXT, -- Année de promotion extraite du matricule
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matricule ON Etudiants(matricule);

-- Table Types de Frais (fixés par l'administration)
CREATE TABLE IF NOT EXISTS TypesFrais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL, -- Ex: Minerval, Frais d'inscription, Bibliothèque
  faculte TEXT NOT NULL,
  montant_usd REAL NOT NULL, -- Montant en dollars US
  description TEXT,
  annee_academique TEXT DEFAULT '2024-2025',
  actif INTEGER DEFAULT 1, -- SQLite boolean (1=true, 0=false)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faculte ON TypesFrais(faculte);
CREATE INDEX IF NOT EXISTS idx_actif ON TypesFrais(actif);

-- Table Taux de Change (pour conversion USD -> CDF)
CREATE TABLE IF NOT EXISTS TauxChange (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taux_usd_cdf REAL NOT NULL, -- Taux USD vers Franc Congolais
  date_maj DATETIME DEFAULT CURRENT_TIMESTAMP,
  actif INTEGER DEFAULT 1 -- SQLite boolean (1=true, 0=false)
);

CREATE INDEX IF NOT EXISTS idx_taux_actif ON TauxChange(actif);

-- Table Paiements
CREATE TABLE IF NOT EXISTS Paiements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  etudiant_id INTEGER NOT NULL,
  type_frais_id INTEGER NOT NULL,
  montant_usd REAL NOT NULL,
  montant_cdf REAL NOT NULL, -- Montant converti en CDF
  taux_change REAL NOT NULL, -- Taux utilisé pour la conversion
  statut TEXT DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'SUCCES', 'ECHEC', 'BON_GENERE')),
  type_operation TEXT DEFAULT 'PAIEMENT_LIGNE' CHECK (type_operation IN ('PAIEMENT_LIGNE', 'BON_PAIEMENT')),
  reference_transaction TEXT UNIQUE,
  date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
  mode_paiement TEXT, -- Mobile Money, Carte Bancaire, Bon de Paiement
  recu_pdf TEXT,
  bon_paiement_pdf TEXT, -- PDF du bon de paiement généré
  qrcode TEXT,
  FOREIGN KEY (etudiant_id) REFERENCES Etudiants(id) ON DELETE CASCADE,
  FOREIGN KEY (type_frais_id) REFERENCES TypesFrais(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_etudiant ON Paiements(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_statut ON Paiements(statut);
CREATE INDEX IF NOT EXISTS idx_type_operation ON Paiements(type_operation);

-- ========================================
-- SEEDS : Données de test
-- ========================================

-- Seeds : Taux de change actuel (1 USD = 2650 CDF approximativement)
INSERT INTO TauxChange (taux_usd_cdf, actif) VALUES (2650.0000, TRUE);

-- Seeds : Etudiants avec mots de passe (hashés avec bcrypt)
INSERT INTO Etudiants (matricule, nom, prenom, email, mot_de_passe, promotion)
VALUES
  ('SI2024001', 'Ngou', 'Paul', 'paul.ngou@upc.cm', '$2b$10$example.hash.password', '2024'),
  ('DR2024002', 'Mbida', 'Sarah', 'sarah.mbida@upc.cm', '$2b$10$example.hash.password', '2024'),
  ('MD2024003', 'Ekani', 'Jean', 'jean.ekani@upc.cm', '$2b$10$example.hash.password', '2024'),
  ('SI2024004', 'Tchoua', 'Aline', 'aline.tchoua@upc.cm', '$2b$10$example.hash.password', '2024'),
  ('DR2024005', 'Owona', 'Luc', 'luc.owona@upc.cm', '$2b$10$example.hash.password', '2024');

-- Seeds : Types de Frais fixés par l'administration (en USD)
INSERT INTO TypesFrais (nom, faculte, montant_usd, description, annee_academique)
VALUES
  -- Sciences Informatiques (SI)
  ('Minerval', 'Sciences Informatiques', 150.00, 'Frais de scolarité annuelle - Sciences Informatiques', '2024-2025'),
  ('Inscription', 'Sciences Informatiques', 25.00, 'Frais d''inscription et d''enrôlement', '2024-2025'),
  ('Bibliothèque', 'Sciences Informatiques', 15.00, 'Accès bibliothèque et ressources numériques', '2024-2025'),
  ('Laboratoire Info', 'Sciences Informatiques', 30.00, 'Utilisation des laboratoires informatiques', '2024-2025'),
  
  -- Droit (DR)
  ('Minerval', 'Droit', 120.00, 'Frais de scolarité annuelle - Faculté de Droit', '2024-2025'),
  ('Inscription', 'Droit', 20.00, 'Frais d''inscription et d''enrôlement', '2024-2025'),
  ('Documentation Juridique', 'Droit', 18.00, 'Accès aux bases de données juridiques', '2024-2025'),
  
  -- Médecine (MD)
  ('Minerval', 'Médecine', 250.00, 'Frais de scolarité annuelle - Faculté de Médecine', '2024-2025'),
  ('Inscription', 'Médecine', 35.00, 'Frais d''inscription et d''enrôlement', '2024-2025'),
  ('Laboratoire Médical', 'Médecine', 45.00, 'Utilisation des laboratoires médicaux', '2024-2025'),
  ('Stage Hospitalier', 'Médecine', 60.00, 'Frais de stage en milieu hospitalier', '2024-2025'),
  
  -- Génie Civil (GC)
  ('Minerval', 'Génie Civil', 180.00, 'Frais de scolarité annuelle - Génie Civil', '2024-2025'),
  ('Inscription', 'Génie Civil', 30.00, 'Frais d''inscription et d''enrôlement', '2024-2025'),
  
  -- Économie (EC)
  ('Minerval', 'Économie', 130.00, 'Frais de scolarité annuelle - Économie', '2024-2025'),
  ('Inscription', 'Économie', 22.00, 'Frais d''inscription et d''enrôlement', '2024-2025');

-- Seeds : Paiements exemples
INSERT INTO Paiements (etudiant_id, type_frais_id, montant_usd, montant_cdf, taux_change, statut, reference_transaction, mode_paiement, type_operation)
VALUES
  (1, 1, 150.00, 397500.00, 2650.0000, 'SUCCES', 'TXN2024001', 'Mobile Money', 'PAIEMENT_LIGNE'),
  (2, 5, 120.00, 318000.00, 2650.0000, 'SUCCES', 'TXN2024002', 'Carte Bancaire', 'PAIEMENT_LIGNE'),
  (3, 8, 250.00, 662500.00, 2650.0000, 'BON_GENERE', 'BON2024001', 'Bon de Paiement', 'BON_PAIEMENT');

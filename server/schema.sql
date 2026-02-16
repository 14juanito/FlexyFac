-- FlexyFac - Schéma SQL Complet
-- Base de données pour la gestion intelligente des frais universitaires

DROP DATABASE IF EXISTS flexyfac;
CREATE DATABASE flexyfac CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flexyfac;

-- Table Etudiants
CREATE TABLE Etudiants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricule VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  date_naissance DATE,
  promotion VARCHAR(10) COMMENT 'Année de promotion extraite du matricule',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_matricule (matricule)
) ENGINE=InnoDB;

-- Table Frais
CREATE TABLE Frais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculte VARCHAR(50) NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  annee_academique VARCHAR(10) DEFAULT '2024-2025',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_faculte (faculte)
) ENGINE=InnoDB;

-- Table Paiements
CREATE TABLE Paiements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  etudiant_id INT NOT NULL,
  frais_id INT NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  statut ENUM('EN_ATTENTE', 'SUCCES', 'ECHEC') DEFAULT 'EN_ATTENTE',
  reference_transaction VARCHAR(100) UNIQUE,
  date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mode_paiement VARCHAR(50) COMMENT 'Mobile Money, Carte Bancaire, Espèces',
  recu_pdf VARCHAR(255),
  qrcode TEXT,
  FOREIGN KEY (etudiant_id) REFERENCES Etudiants(id) ON DELETE CASCADE,
  FOREIGN KEY (frais_id) REFERENCES Frais(id) ON DELETE CASCADE,
  INDEX idx_etudiant (etudiant_id),
  INDEX idx_statut (statut)
) ENGINE=InnoDB;

-- ========================================
-- SEEDS : Données de test
-- ========================================

-- Seeds : Etudiants (5 étudiants de différentes facultés)
INSERT INTO Etudiants (matricule, nom, prenom, email, date_naissance, promotion)
VALUES
  ('SI2024001', 'Ngou', 'Paul', 'paul.ngou@upc.cm', '2002-03-15', '2024'),
  ('DR2024002', 'Mbida', 'Sarah', 'sarah.mbida@upc.cm', '2001-07-22', '2024'),
  ('MD2024003', 'Ekani', 'Jean', 'jean.ekani@upc.cm', '2003-01-10', '2024'),
  ('SI2024004', 'Tchoua', 'Aline', 'aline.tchoua@upc.cm', '2002-11-05', '2024'),
  ('DR2024005', 'Owona', 'Luc', 'luc.owona@upc.cm', '2000-09-30', '2024');

-- Seeds : Frais (par faculté)
INSERT INTO Frais (faculte, montant, description, annee_academique)
VALUES
  ('Info', 50000.00, 'Minerval Sciences Informatiques', '2024-2025'),
  ('Info', 10000.00, 'Frais d\'enrôlement Sciences Info', '2024-2025'),
  ('Info', 5000.00, 'Frais de bibliothèque', '2024-2025'),
  ('Droit', 45000.00, 'Minerval Faculté de Droit', '2024-2025'),
  ('Droit', 8000.00, 'Frais d\'enrôlement Droit', '2024-2025'),
  ('Droit', 4000.00, 'Frais de documentation juridique', '2024-2025'),
  ('Medecine', 70000.00, 'Minerval Faculté de Médecine', '2024-2025'),
  ('Medecine', 12000.00, 'Frais d\'enrôlement Médecine', '2024-2025'),
  ('Medecine', 8000.00, 'Frais de laboratoire', '2024-2025');

-- Seeds : Paiements (exemples de paiements réussis)
INSERT INTO Paiements (etudiant_id, frais_id, montant, statut, reference_transaction, mode_paiement)
VALUES
  (1, 1, 50000.00, 'SUCCES', 'TXN2024001', 'Mobile Money'),
  (2, 4, 45000.00, 'SUCCES', 'TXN2024002', 'Carte Bancaire');

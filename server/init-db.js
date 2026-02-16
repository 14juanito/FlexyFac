const { db } = require('./config/database');

console.log('🔧 Initialisation de la base de données...');

// Création des tables
db.exec(`
  -- Table Etudiants
  CREATE TABLE IF NOT EXISTS Etudiants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    date_naissance TEXT,
    promotion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Table Frais
  CREATE TABLE IF NOT EXISTS Frais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculte TEXT NOT NULL,
    montant REAL NOT NULL,
    description TEXT,
    annee_academique TEXT DEFAULT '2024-2025',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Table Paiements
  CREATE TABLE IF NOT EXISTS Paiements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    etudiant_id INTEGER NOT NULL,
    frais_id INTEGER NOT NULL,
    montant REAL NOT NULL,
    statut TEXT DEFAULT 'EN_ATTENTE' CHECK(statut IN ('EN_ATTENTE', 'SUCCES', 'ECHEC')),
    reference_transaction TEXT UNIQUE,
    date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
    mode_paiement TEXT,
    recu_pdf TEXT,
    qrcode TEXT,
    FOREIGN KEY (etudiant_id) REFERENCES Etudiants(id) ON DELETE CASCADE,
    FOREIGN KEY (frais_id) REFERENCES Frais(id) ON DELETE CASCADE
  );

  -- Index pour performances
  CREATE INDEX IF NOT EXISTS idx_matricule ON Etudiants(matricule);
  CREATE INDEX IF NOT EXISTS idx_faculte ON Frais(faculte);
  CREATE INDEX IF NOT EXISTS idx_etudiant ON Paiements(etudiant_id);
  CREATE INDEX IF NOT EXISTS idx_statut ON Paiements(statut);
`);

console.log('✅ Tables créées');

// Vérifier si des données existent déjà
const count = db.prepare('SELECT COUNT(*) as count FROM Etudiants').get();

if (count.count === 0) {
  console.log('📝 Insertion des données de test...');

  // Seeds : Etudiants
  const insertEtudiant = db.prepare(`
    INSERT INTO Etudiants (matricule, nom, prenom, email, date_naissance, promotion)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const etudiants = [
    ['SI2024001', 'Ngou', 'Paul', 'paul.ngou@upc.cm', '2002-03-15', '2024'],
    ['DR2024002', 'Mbida', 'Sarah', 'sarah.mbida@upc.cm', '2001-07-22', '2024'],
    ['MD2024003', 'Ekani', 'Jean', 'jean.ekani@upc.cm', '2003-01-10', '2024'],
    ['SI2024004', 'Tchoua', 'Aline', 'aline.tchoua@upc.cm', '2002-11-05', '2024'],
    ['DR2024005', 'Owona', 'Luc', 'luc.owona@upc.cm', '2000-09-30', '2024']
  ];

  etudiants.forEach(e => insertEtudiant.run(e));

  // Seeds : Frais
  const insertFrais = db.prepare(`
    INSERT INTO Frais (faculte, montant, description, annee_academique)
    VALUES (?, ?, ?, ?)
  `);

  const frais = [
    ['Info', 50000.00, 'Minerval Sciences Informatiques', '2024-2025'],
    ['Info', 10000.00, 'Frais d\'enrôlement Sciences Info', '2024-2025'],
    ['Info', 5000.00, 'Frais de bibliothèque', '2024-2025'],
    ['Droit', 45000.00, 'Minerval Faculté de Droit', '2024-2025'],
    ['Droit', 8000.00, 'Frais d\'enrôlement Droit', '2024-2025'],
    ['Droit', 4000.00, 'Frais de documentation juridique', '2024-2025'],
    ['Medecine', 70000.00, 'Minerval Faculté de Médecine', '2024-2025'],
    ['Medecine', 12000.00, 'Frais d\'enrôlement Médecine', '2024-2025'],
    ['Medecine', 8000.00, 'Frais de laboratoire', '2024-2025']
  ];

  frais.forEach(f => insertFrais.run(f));

  // Seeds : Paiements
  const insertPaiement = db.prepare(`
    INSERT INTO Paiements (etudiant_id, frais_id, montant, statut, reference_transaction, mode_paiement)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertPaiement.run([1, 1, 50000.00, 'SUCCES', 'TXN2024001', 'Mobile Money']);
  insertPaiement.run([2, 4, 45000.00, 'SUCCES', 'TXN2024002', 'Carte Bancaire']);

  console.log('✅ Données de test insérées');
} else {
  console.log('ℹ️  Données déjà présentes, skip seeds');
}

console.log('🎉 Base de données prête !');
db.close();

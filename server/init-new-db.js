const { initDatabase, saveDatabase } = require('./config/database');

(async () => {
  console.log('🔧 Initialisation de la base de données...');
  
  const db = await initDatabase();

  // Création des tables
  db.run(`
    CREATE TABLE IF NOT EXISTS Etudiants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mot_de_passe TEXT,
      date_naissance TEXT,
      promotion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS TypesFrais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      faculte TEXT NOT NULL,
      nom TEXT NOT NULL,
      montant_usd REAL NOT NULL,
      description TEXT,
      actif INTEGER DEFAULT 1,
      annee_academique TEXT DEFAULT '2024-2025',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS TauxChange (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taux_usd_cdf REAL NOT NULL,
      date_maj DATETIME DEFAULT CURRENT_TIMESTAMP,
      actif INTEGER DEFAULT 1
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Paiements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      etudiant_id INTEGER NOT NULL,
      type_frais_id INTEGER NOT NULL,
      montant_usd REAL NOT NULL,
      montant_cdf REAL NOT NULL,
      taux_change REAL NOT NULL,
      statut TEXT DEFAULT 'EN_ATTENTE' CHECK(statut IN ('EN_ATTENTE', 'SUCCES', 'ECHEC')),
      reference_transaction TEXT UNIQUE,
      date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
      mode_paiement TEXT,
      recu_pdf TEXT,
      qrcode TEXT,
      FOREIGN KEY (etudiant_id) REFERENCES Etudiants(id) ON DELETE CASCADE,
      FOREIGN KEY (type_frais_id) REFERENCES TypesFrais(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Tables créées');

  // Vérifier si des données existent déjà
  const result = db.exec('SELECT COUNT(*) as count FROM Etudiants');
  const count = result[0]?.values[0]?.[0] || 0;

  if (count === 0) {
    console.log('📝 Insertion des données de test...');

    // Taux de change
    db.run(`INSERT INTO TauxChange (taux_usd_cdf, actif) VALUES (2650, 1)`);

    // Types de frais
    db.run(`INSERT INTO TypesFrais (faculte, nom, montant_usd, description, actif) VALUES 
      ('Info', 'Minerval', 150, 'Minerval Sciences Informatiques', 1),
      ('Info', 'Enrôlement', 30, 'Frais d''enrôlement Sciences Info', 1),
      ('Info', 'Bibliothèque', 15, 'Frais de bibliothèque', 1),
      ('Droit', 'Minerval', 120, 'Minerval Faculté de Droit', 1),
      ('Droit', 'Enrôlement', 25, 'Frais d''enrôlement Droit', 1),
      ('Droit', 'Documentation', 12, 'Frais de documentation juridique', 1),
      ('Medecine', 'Minerval', 200, 'Minerval Faculté de Médecine', 1),
      ('Medecine', 'Enrôlement', 40, 'Frais d''enrôlement Médecine', 1),
      ('Medecine', 'Laboratoire', 25, 'Frais de laboratoire', 1)
    `);

    // Etudiants (sans mot de passe pour les tests)
    db.run(`INSERT INTO Etudiants (matricule, nom, prenom, email, promotion) VALUES 
      ('SI2024001', 'Ngou', 'Paul', 'paul.ngou@upc.cm', '2024'),
      ('DR2024002', 'Mbida', 'Sarah', 'sarah.mbida@upc.cm', '2024'),
      ('MD2024003', 'Ekani', 'Jean', 'jean.ekani@upc.cm', '2024'),
      ('SI2024004', 'Tchoua', 'Aline', 'aline.tchoua@upc.cm', '2024'),
      ('DR2024005', 'Owona', 'Luc', 'luc.owona@upc.cm', '2024')
    `);

    console.log('✅ Données de test insérées');
  } else {
    console.log('ℹ️  Données déjà présentes, skip seeds');
  }

  console.log('🎉 Base de données prête !');
  saveDatabase();
  process.exit(0);
})();
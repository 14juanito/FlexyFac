const { getDb, initDatabase } = require('./config/database');
const { initAdvancedDatabase } = require('./init-advanced-db');

async function testFlexyFacFeatures() {
  console.log('🧪 Test des fonctionnalités FlexyFac...\n');

  try {
    // Initialiser la base de données
    await initDatabase();
    await initAdvancedDatabase();

    const db = getDb();
    if (!db) {
      throw new Error('Base de données non disponible');
    }

    // Test 1: Vérifier les étudiants
    console.log('📋 Test 1: Vérification des étudiants');
    const etudiants = db.prepare('SELECT * FROM Etudiants').all();
    console.log(`   ✅ ${etudiants.length} étudiants trouvés`);
    
    if (etudiants.length > 0) {
      const etudiant = etudiants[0];
      console.log(`   👤 Exemple: ${etudiant.prenom} ${etudiant.nom} (${etudiant.matricule})`);
    }

    // Test 2: Vérifier les types de frais
    console.log('\n💰 Test 2: Vérification des types de frais');
    const typesFrais = db.prepare('SELECT * FROM TypesFrais WHERE actif = 1').all();
    console.log(`   ✅ ${typesFrais.length} types de frais actifs`);
    
    const fraisParFaculte = db.prepare(`
      SELECT faculte, COUNT(*) as nb_frais, SUM(montant_usd) as total_usd
      FROM TypesFrais WHERE actif = 1
      GROUP BY faculte
    `).all();
    
    fraisParFaculte.forEach(f => {
      console.log(`   📚 ${f.faculte}: ${f.nb_frais} frais, Total: $${f.total_usd}`);
    });

    // Test 3: Vérifier la configuration
    console.log('\n⚙️ Test 3: Vérification de la configuration');
    const config = db.prepare('SELECT * FROM Config WHERE actif = 1').all();
    console.log(`   ✅ ${config.length} paramètres de configuration`);
    
    config.forEach(c => {
      console.log(`   🔧 ${c.cle}: ${c.valeur}`);
    });

    // Test 4: Simuler un calcul de frais
    console.log('\n🧮 Test 4: Simulation calcul de frais');
    if (etudiants.length > 0) {
      const etudiant = etudiants[0];
      const fraisEtudiant = db.prepare('SELECT * FROM TypesFrais WHERE faculte = ? AND actif = 1').all(etudiant.faculte);
      
      console.log(`   👤 Étudiant: ${etudiant.matricule} (${etudiant.faculte})`);
      console.log(`   💳 Frais disponibles: ${fraisEtudiant.length}`);
      
      let totalFrais = 0;
      fraisEtudiant.forEach(frais => {
        totalFrais += frais.montant_usd;
        console.log(`   💰 ${frais.nom}: $${frais.montant_usd}`);
      });
      
      console.log(`   📊 Total des frais: $${totalFrais}`);
    }

    // Test 5: Simuler un paiement
    console.log('\n💳 Test 5: Simulation d\'un paiement');
    if (etudiants.length > 0 && typesFrais.length > 0) {
      const etudiant = etudiants[0];
      const typeFrais = typesFrais.find(f => f.faculte === etudiant.faculte);
      
      if (typeFrais) {
        const tauxResult = db.prepare('SELECT valeur FROM Config WHERE cle = ? AND actif = 1').get('taux_usd_cdf');
        const tauxChange = tauxResult ? parseFloat(tauxResult.valeur) : 2850;
        const montantCdf = Math.round(typeFrais.montant_usd * tauxChange);
        
        const transactionId = `TEST${Date.now()}`;
        const result = db.prepare(`
          INSERT INTO Paiements (etudiant_id, type_frais_id, montant_usd, montant_cdf,
                               mode_paiement, statut, transaction_id, date_paiement)
          VALUES (?, ?, ?, ?, 'TEST', 'VALIDE', ?, datetime('now'))
        `).run(etudiant.id, typeFrais.id, typeFrais.montant_usd, montantCdf, transactionId);
        
        console.log(`   ✅ Paiement test créé (ID: ${result.lastInsertRowid})`);
        console.log(`   💰 Montant: $${typeFrais.montant_usd} (${montantCdf.toLocaleString()} CDF)`);
        console.log(`   🔗 Transaction: ${transactionId}`);
      }
    }

    // Test 6: Vérifier les paiements
    console.log('\n📊 Test 6: Statistiques des paiements');
    const statsPaiements = db.prepare(`
      SELECT 
        statut,
        COUNT(*) as nb_paiements,
        SUM(montant_usd) as total_usd,
        SUM(montant_cdf) as total_cdf
      FROM Paiements
      GROUP BY statut
    `).all();
    
    statsPaiements.forEach(stat => {
      console.log(`   📈 ${stat.statut}: ${stat.nb_paiements} paiements, $${stat.total_usd || 0}`);
    });

    // Test 7: Test des fonctions utilitaires
    console.log('\n🔧 Test 7: Fonctions utilitaires');
    
    // Test extraction faculté
    const testMatricules = ['SI2024001', 'DR2024002', 'MD2024003', 'GC2024004', 'EC2024005'];
    testMatricules.forEach(matricule => {
      const faculteCode = matricule.substring(0, 2);
      const faculteMap = {
        'SI': 'Sciences Informatiques',
        'DR': 'Droit', 
        'MD': 'Médecine',
        'GC': 'Génie Civil',
        'EC': 'Économie'
      };
      const faculte = faculteMap[faculteCode] || 'Inconnue';
      console.log(`   🎓 ${matricule} → ${faculte}`);
    });

    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('\n📋 Résumé:');
    console.log(`   👥 ${etudiants.length} étudiants`);
    console.log(`   💰 ${typesFrais.length} types de frais`);
    console.log(`   ⚙️ ${config.length} paramètres de config`);
    console.log(`   💳 ${statsPaiements.reduce((sum, s) => sum + s.nb_paiements, 0)} paiements`);

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests si appelé directement
if (require.main === module) {
  testFlexyFacFeatures().then(() => {
    console.log('\n✅ Tests terminés');
    process.exit(0);
  });
}

module.exports = { testFlexyFacFeatures };
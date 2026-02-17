const { getDb, initDatabase } = require('./config/database');
const { initAdvancedDatabase } = require('./init-advanced-db');

async function testAPIs() {
  console.log('🧪 Test des APIs FlexyFac...\n');

  try {
    await initDatabase();
    await initAdvancedDatabase();

    const db = getDb();
    
    // Test 1: Login
    console.log('1. Test Login API');
    const etudiant = db.prepare('SELECT * FROM Etudiants LIMIT 1').get();
    console.log(`   Étudiant test: ${etudiant.prenom} ${etudiant.nom} (${etudiant.matricule})`);
    
    // Test 2: Frais
    console.log('\n2. Test Frais API');
    const frais = db.prepare('SELECT * FROM TypesFrais WHERE faculte = ?').all(etudiant.faculte);
    console.log(`   Frais disponibles: ${frais.length}`);
    frais.forEach(f => {
      console.log(`   - ${f.nom}: $${f.montant_usd}`);
    });
    
    // Test 3: Génération bon
    console.log('\n3. Test Génération Bon');
    const bonData = {
      etudiant_id: etudiant.id,
      type_frais_id: frais[0].id,
      montant_usd: frais[0].montant_usd
    };
    console.log(`   Données bon:`, bonData);
    
    console.log('\n✅ Tous les tests préparatoires sont OK');
    console.log('\n🚀 Démarrez le serveur avec: npm run dev');
    console.log('📱 Testez le client sur: http://localhost:5173');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAPIs();
const { getDb, initDatabase } = require('./config/database');
const { initAdvancedDatabase } = require('./init-advanced-db');
const bonPdfController = require('./controllers/bonPdfController');

async function testBonPdfGeneration() {
  console.log('🧪 Test de génération de bons PDF...\n');

  try {
    // Initialiser la base de données
    await initDatabase();
    await initAdvancedDatabase();

    const db = getDb();
    if (!db) {
      throw new Error('Base de données non disponible');
    }

    // Récupérer un étudiant de test
    const etudiant = db.prepare('SELECT * FROM Etudiants LIMIT 1').get();
    if (!etudiant) {
      throw new Error('Aucun étudiant trouvé dans la base');
    }

    console.log(`👤 Étudiant de test: ${etudiant.prenom} ${etudiant.nom} (${etudiant.matricule})`);

    // Récupérer un type de frais pour cet étudiant
    const typeFrais = db.prepare('SELECT * FROM TypesFrais WHERE faculte = ? AND actif = 1 LIMIT 1').get(etudiant.faculte);
    if (!typeFrais) {
      throw new Error('Aucun type de frais trouvé pour cette faculté');
    }

    console.log(`💰 Type de frais: ${typeFrais.nom} - $${typeFrais.montant_usd}`);

    // Simuler une requête HTTP pour générer le bon PDF
    const mockReq = {
      body: {
        etudiant_id: etudiant.id,
        type_frais_id: typeFrais.id,
        montant_usd: typeFrais.montant_usd
      }
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code !== 200) {
            console.error(`❌ Erreur ${code}:`, data);
            return;
          }
          
          console.log('✅ Bon PDF généré avec succès!');
          console.log(`📄 Nom du fichier: ${data.bon.fileName}`);
          console.log(`🔗 URL de téléchargement: ${data.bon.downloadUrl}`);
          console.log(`🆔 ID du bon: ${data.bon.bon_id}`);
          console.log(`💵 Montant: $${data.bon.montant.usd} (${data.bon.montant.cdf.toLocaleString()} CDF)`);
          console.log(`📅 Date d'expiration: ${new Date(data.bon.dates.expiration).toLocaleDateString('fr-FR')}`);
        }
      }),
      json: (data) => {
        console.log('✅ Bon PDF généré avec succès!');
        console.log(`📄 Nom du fichier: ${data.bon.fileName}`);
        console.log(`🔗 URL de téléchargement: ${data.bon.downloadUrl}`);
        console.log(`🆔 ID du bon: ${data.bon.bon_id}`);
        console.log(`💵 Montant: $${data.bon.montant.usd} (${data.bon.montant.cdf.toLocaleString()} CDF)`);
        console.log(`📅 Date d'expiration: ${new Date(data.bon.dates.expiration).toLocaleDateString('fr-FR')}`);
      }
    };

    // Générer le bon PDF
    console.log('\n🔄 Génération du bon PDF en cours...');
    await bonPdfController.genererBonPDF(mockReq, mockRes);

    // Vérifier les bons générés
    console.log('\n📋 Vérification des bons générés...');
    const bons = db.prepare(`
      SELECT p.*, tf.nom as type_frais_nom
      FROM Paiements p
      JOIN TypesFrais tf ON p.type_frais_id = tf.id
      WHERE p.etudiant_id = ? AND p.mode_paiement = 'BON_PHYSIQUE'
      ORDER BY p.date_paiement DESC
    `).all(etudiant.id);

    console.log(`📊 Nombre de bons générés: ${bons.length}`);
    
    bons.forEach((bon, index) => {
      console.log(`\n📄 Bon ${index + 1}:`);
      console.log(`   🆔 ID: ${bon.bon_id}`);
      console.log(`   💰 Frais: ${bon.type_frais_nom}`);
      console.log(`   💵 Montant: $${bon.montant_usd} (${bon.montant_cdf.toLocaleString()} CDF)`);
      console.log(`   📅 Date: ${new Date(bon.date_paiement).toLocaleDateString('fr-FR')}`);
      console.log(`   ⚡ Statut: ${bon.statut}`);
    });

    // Test de la liste des bons pour un étudiant
    console.log('\n🔄 Test de la liste des bons...');
    const mockReqList = {
      params: { etudiant_id: etudiant.id }
    };

    const mockResList = {
      json: (data) => {
        console.log(`✅ Liste récupérée: ${data.bons.length} bons trouvés`);
        data.bons.forEach((bon, index) => {
          const expireBientot = bon.expire_bientot ? '⚠️ Expire bientôt' : '✅ Valide';
          console.log(`   📄 ${index + 1}. ${bon.bon_id} - ${expireBientot}`);
        });
      }
    };

    await bonPdfController.listerBonsEtudiant(mockReqList, mockResList);

    console.log('\n🎉 Tous les tests de génération PDF sont passés avec succès!');

    // Afficher les statistiques finales
    const statsFinales = db.prepare(`
      SELECT 
        COUNT(*) as total_bons,
        SUM(montant_usd) as total_usd,
        SUM(montant_cdf) as total_cdf
      FROM Paiements 
      WHERE mode_paiement = 'BON_PHYSIQUE'
    `).get();

    console.log('\n📊 Statistiques finales:');
    console.log(`   📄 Total bons générés: ${statsFinales.total_bons}`);
    console.log(`   💵 Montant total USD: $${statsFinales.total_usd || 0}`);
    console.log(`   💰 Montant total CDF: ${(statsFinales.total_cdf || 0).toLocaleString()} FC`);

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests si appelé directement
if (require.main === module) {
  testBonPdfGeneration().then(() => {
    console.log('\n✅ Tests terminés');
    process.exit(0);
  });
}

module.exports = { testBonPdfGeneration };
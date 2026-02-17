const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const fraisRoutes = require('./routes/fraisRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const paiementAdvancedRoutes = require('./routes/paiementAdvancedRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const bonPdfRoutes = require('./routes/bonPdfRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => callback(null, origin || '*'),
  credentials: true
}));

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/frais', fraisRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/paiements', paiementAdvancedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/pdf-bon', bonPdfRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'FlexyFac API is running' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur serveur', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Initialiser la DB puis démarrer le serveur
(async () => {
  try {
    console.log('🔧 Initialisation de la base de données...');
    await initDatabase();
    
    // Exécuter le script d'initialisation si la DB est vide
    const { getDb } = require('./config/database');
    const db = getDb();
    
    if (db) {
      const result = db.prepare('SELECT name FROM sqlite_master WHERE type=? AND name=?').all('table', 'Etudiants');
      
      if (!result || result.length === 0) {
        console.log('📝 Création des tables et insertion des données...');
        require('./init-db');
      } else {
        console.log('✅ Base de données déjà initialisée');
      }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur FlexyFac démarré sur http://localhost:${PORT}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
})();

module.exports = app;

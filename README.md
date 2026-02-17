# 🎓 FlexyFac - Plateforme Intelligente de Gestion des Frais Universitaires

Système de gestion automatisé des frais universitaires pour l'UPC (Université Protestante du Congo).

## ✨ Fonctionnalités

- 🔐 **Authentification par matricule** - Connexion simplifiée
- 🧠 **Reconnaissance intelligente** - Extraction automatique de la faculté depuis le matricule
- 💳 **Gestion des paiements** - Mobile Money, Carte Bancaire
- 📄 **Génération de reçus PDF** - Avec QR Code de vérification
- 📊 **Dashboard étudiant** - Historique et suivi des paiements

## 🏗️ Architecture

```
FlexyFac/
├── server/          # Backend Node.js + Express + SQLite
│   ├── config/      # Configuration DB
│   ├── controllers/ # Logique métier
│   ├── routes/      # Routes API
│   └── utils/       # Utilitaires (extraction faculté, PDF, QR)
└── client/          # Frontend React + Vite + Tailwind (à venir)
```

## 🚀 Installation Rapide

```bash
# Cloner le projet
git clone https://github.com/VOTRE_USERNAME/FlexyFac.git
cd FlexyFac

# Installer et démarrer
cd server
npm install
npm run dev
```

Le serveur démarre sur **http://localhost:5000** 🎉

## 📡 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion par matricule
- `GET /api/auth/check-matricule/:matricule` - Vérification + frais associés

### Exemple
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"matricule":"SI2024001"}'
```

## 🧠 Logique Intelligente

Le système reconnaît automatiquement la faculté depuis le matricule :

| Code | Faculté |
|------|---------|
| **SI** | Sciences Informatiques |
| **DR** | Droit |
| **MD** | Médecine |
| **GC** | Génie Civil |
| **EC** | Économie |

Format : `XX2024XXX` (ex: SI2024001)

## 🛠️ Technologies

- **Backend** : Node.js, Express.js
- **Base de données** : SQLite (zéro configuration)
- **Sécurité** : Helmet, CORS
- **PDF** : PDFKit
- **QR Code** : qrcode

## 📦 Déploiement

Compatible avec :
- ✅ Render.com (gratuit)
- ✅ Railway.app
- ✅ Vercel
- ✅ Heroku

Voir [DEPLOIEMENT.md](DEPLOIEMENT.md) pour les détails.

## 📝 Roadmap

- [x] **Sprint 1** : Authentification + Reconnaissance intelligente ✅
- [x] **Sprint 2** : Logique métier (calcul frais avancé) ✅
- [x] **Sprint 3** : Génération PDF + QR Code ✅
- [x] **Sprint 4** : Simulation paiement avancée ✅
- [ ] **Sprint 5** : Dashboard React (en cours)

## 🆕 Nouvelles Fonctionnalités

### 🧠 Logique Métier Avancée
- ✅ Calcul intelligent des frais avec statut de paiement
- ✅ Validation automatique des montants
- ✅ Gestion des paiements partiels
- ✅ Prévention des sur-paiements
- ✅ Statistiques détaillées par étudiant

### 📄 Génération PDF + QR Code
- ✅ Reçus PDF professionnels avec QR Code
- ✅ Vérification d'authenticité via QR Code
- ✅ Bons de paiement physiques
- ✅ Téléchargement sécurisé des documents

### 💳 Paiements Avancés
- ✅ Simulation réaliste selon le mode de paiement
- ✅ Gestion des bons physiques avec expiration
- ✅ Validation administrative des bons
- ✅ Historique paginé avec filtres

## 🚀 Démarrage Complet

```bash
# Démarrage automatisé complet
start-complete.bat

# Ou étape par étape
cd server
npm install
node init-advanced-db.js
npm run dev
```

## 📡 Nouvelles API

### Frais Avancés
- `GET /api/frais/:matricule` - Calcul frais avec statuts
- `POST /api/frais/paiement` - Paiement avec validation
- `POST /api/frais/bon` - Génération bon physique
- `GET /api/frais/historique/:etudiant_id` - Historique paginé

### PDF et QR Codes
- `POST /api/pdf/recu/:paiementId` - Générer reçu PDF
- `GET /api/pdf/download/:fileName` - Télécharger PDF
- `GET /api/pdf/verify/:paiementId` - Vérifier via QR Code

Voir [API-DOCUMENTATION.md](API-DOCUMENTATION.md) pour les détails complets.

## 👥 Contributeurs

Développé avec ❤️ pour l'UPC

## 📄 Licence

MIT License

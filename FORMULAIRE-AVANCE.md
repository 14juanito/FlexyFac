# 🎯 Formulaire de Paiement Avancé - FlexyFac

## ✨ Fonctionnalités Clés

### 🔄 Conversion Automatique USD/CDF
- **Affichage dynamique** : Sélection d'un frais → Montant USD et CDF instantané
- **Taux configurable** : 1$ = 2850 CDF (modifiable via base de données)
- **Calcul en temps réel** : `montant_cdf = montant_usd * taux_change`

### 🎨 Interface Intelligente
- **Auto-remplissage** : Nom, matricule, faculté pré-remplis
- **Sélection intuitive** : Menu déroulant des frais par faculté
- **Feedback visuel** : Animation lors du changement de montant

### 💳 Double Option de Paiement

#### 1. Paiement en Ligne
```javascript
// Route: POST /api/paiements/payer-en-ligne
{
  "etudiant_id": 1,
  "type_frais_id": 2,
  "montant_usd": 150.00,
  "montant_cdf": 427500,
  "mode_paiement": "EN_LIGNE"
}
```

#### 2. Bon de Paiement PDF
```javascript
// Route: POST /api/paiements/generer-bon
// Génère un PDF avec:
// - Informations étudiant
// - Détails du frais
// - QR Code de vérification
// - Instructions bancaires
```

## 🏗️ Architecture Technique

### Backend (Node.js)
```
server/
├── controllers/
│   └── paiementAdvancedController.js  # Logique paiement USD/CDF
├── routes/
│   └── paiementAdvancedRoutes.js      # Routes /payer-en-ligne, /generer-bon
└── schema-advanced.sql                # Tables Etudiants, TypesFrais, Config
```

### Frontend (React)
```
client/src/components/
└── PaymentFormAdvanced.jsx            # Formulaire avec conversion USD/CDF
```

## 📊 Base de Données

### Tables Principales
```sql
-- Étudiants avec inscription complète
Etudiants (nom, postnom, prenom, matricule, email, password, faculte)

-- Frais en USD par faculté
TypesFrais (faculte, nom, montant_usd, description)

-- Configuration système
Config (cle, valeur) -- Ex: taux_usd_cdf = 2850

-- Historique paiements
Paiements (etudiant_id, montant_usd, montant_cdf, mode_paiement, statut)
```

## 🚀 Installation & Démarrage

### 1. Installation des dépendances
```bash
# Exécuter le script d'installation
install-advanced.bat

# Ou manuellement:
cd server && npm install pdfkit qrcode jsonwebtoken bcrypt
cd client && npm install framer-motion react-hot-toast lucide-react
```

### 2. Initialisation de la DB
```bash
cd server
node init-advanced-db.js
```

### 3. Démarrage
```bash
# Script automatique
start-advanced.bat

# Ou manuellement:
cd server && npm run dev
cd client && npm run dev
```

## 🎮 Utilisation

### 1. Connexion
- **Matricule** : SI2024001, DR2024002, MD2024003...
- **Password** : password123

### 2. Formulaire de Paiement
1. Cliquer sur "Nouveau Paiement"
2. Choisir "Avancé" dans le toggle
3. Sélectionner un type de frais
4. ✨ **Montants USD/CDF s'affichent automatiquement**
5. Choisir : "Payer en ligne" ou "Générer bon"

### 3. Résultats
- **Paiement en ligne** : Redirection vers simulation
- **Bon PDF** : Téléchargement automatique avec QR Code

## 🔧 Configuration

### Modifier le taux de change
```sql
UPDATE Config SET valeur = '2900' WHERE cle = 'taux_usd_cdf';
```

### Ajouter des frais
```sql
INSERT INTO TypesFrais (faculte, nom, montant_usd, description) 
VALUES ('Sciences Informatiques', 'Frais de stage', 60.00, 'Stage en entreprise');
```

## 🎯 Avantages UX

1. **Zéro saisie manuelle** : Tout est pré-rempli
2. **Transparence financière** : Voir USD et CDF simultanément
3. **Flexibilité** : Choix entre paiement digital et physique
4. **Sécurité** : QR Code pour vérification bancaire
5. **Accessibilité** : Pas d'obligation de paiement en ligne

## 🔄 Workflow Complet

```
Connexion → Dashboard → "Nouveau Paiement" → 
Sélection Frais → Affichage USD/CDF → 
Choix Mode → Paiement/PDF → Confirmation
```

Cette architecture respecte parfaitement les contraintes du contexte congolais tout en offrant une expérience utilisateur moderne et intuitive.
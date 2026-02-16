# FlexyFac Backend - API Documentation

## 🚀 Installation

```bash
cd server
npm install
cp .env.example .env
# Configurer les variables dans .env
```

## 📊 Configuration Base de Données

```bash
# Importer le schéma SQL
mysql -u root -p < schema.sql
```

## ▶️ Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🔌 Routes API

### Authentification

#### POST /api/auth/login
Connexion par matricule uniquement

**Body:**
```json
{
  "matricule": "SI2024001"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "id": 1,
    "matricule": "SI2024001",
    "nom": "Ngou",
    "prenom": "Paul",
    "email": "paul.ngou@upc.cm",
    "faculte": "Info",
    "promotion": "2024"
  }
}
```

#### GET /api/auth/check-matricule/:matricule
Vérification du matricule et récupération des frais associés

**Exemple:** `/api/auth/check-matricule/SI2024001`

**Réponse:**
```json
{
  "success": true,
  "data": {
    "etudiant": {
      "id": 1,
      "matricule": "SI2024001",
      "nom": "Ngou",
      "prenom": "Paul"
    },
    "faculte": "Info",
    "frais": [
      {
        "id": 1,
        "faculte": "Info",
        "montant": 50000,
        "description": "Minerval Sciences Info"
      }
    ]
  }
}
```

## 🧠 Logique Intelligente

Le système extrait automatiquement la faculté depuis le matricule :
- **SI** → Sciences Informatiques
- **DR** → Droit
- **MD** → Médecine
- **GC** → Génie Civil
- **EC** → Économie
- **LT** → Lettres

Format matricule : `XX2024XXX` (2 lettres + 4 chiffres année + numéro)

## 📁 Structure

```
server/
├── config/          # Configuration DB
├── controllers/     # Logique métier
├── routes/          # Routes Express
├── utils/           # Utilitaires (extraction faculté, PDF, QR)
├── models/          # Modèles (à venir)
├── index.js         # Point d'entrée
└── schema.sql       # Schéma BDD
```

## 🔐 Sécurité

- Helmet.js pour les headers HTTP
- CORS configuré
- Validation des entrées
- Gestion des erreurs centralisée

# 📡 API FlexyFac - Documentation Complète

## 🚀 Sprints Implémentés

- ✅ **Sprint 1** : Authentification + Reconnaissance intelligente
- ✅ **Sprint 2** : Logique métier (calcul frais avancé)
- ✅ **Sprint 3** : Génération PDF + QR Code
- ✅ **Sprint 4** : Simulation paiement avancée

## 🔐 Authentification

### POST `/api/auth/login`
Connexion par matricule (authentification simplifiée)

```json
{
  "matricule": "SI2024001"
}
```

**Réponse:**
```json
{
  "success": true,
  "etudiant": {
    "id": 1,
    "matricule": "SI2024001",
    "nom": "MUKENDI",
    "prenom": "Jean",
    "faculte": "Sciences Informatiques"
  },
  "typesFrais": [...],
  "tauxChange": 2850
}
```

### POST `/api/auth/register`
Inscription d'un nouvel étudiant

```json
{
  "nom": "TSHIMANGA",
  "prenom": "Marie",
  "matricule": "DR2024006",
  "email": "marie@upc.ac.cd",
  "password": "motdepasse123"
}
```

## 💰 Gestion des Frais

### GET `/api/frais/:matricule`
Calculer les frais avec statut de paiement avancé

**Réponse:**
```json
{
  "success": true,
  "etudiant": {...},
  "frais": [
    {
      "id": 1,
      "nom": "Frais d'inscription",
      "montant_usd": 150.00,
      "montant_cdf": 427500,
      "total_paye": 0,
      "montant_restant": 150.00,
      "statut_paiement": "NON_PAYE"
    }
  ],
  "statistiques": {
    "totalFrais": 390.00,
    "totalPaye": 0,
    "totalRestant": 390.00,
    "pourcentagePaye": 0
  }
}
```

### POST `/api/frais/paiement`
Effectuer un paiement avec validation complète

```json
{
  "etudiant_id": 1,
  "type_frais_id": 1,
  "montant_usd": 150.00,
  "mode_paiement": "MOBILE_MONEY"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Paiement effectué avec succès",
  "paiement": {
    "id": 15,
    "transaction_id": "MOB1703123456ABCD",
    "montant_usd": 150.00,
    "montant_cdf": 427500,
    "statut": "VALIDE"
  },
  "frais": {
    "nom": "Frais d'inscription",
    "montant_total": 150.00,
    "total_paye": 150.00,
    "montant_restant": 0,
    "statut": "COMPLET"
  }
}
```

### POST `/api/frais/bon`
Générer un bon de paiement physique

```json
{
  "etudiant_id": 1,
  "type_frais_id": 2,
  "montant_usd": 80.00
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Bon de paiement généré avec succès",
  "bon": {
    "id": 16,
    "bon_id": "BON456WXYZ",
    "etudiant": {
      "nom": "Jean MUKENDI",
      "matricule": "SI2024001",
      "faculte": "Sciences Informatiques"
    },
    "montant": {
      "usd": 80.00,
      "cdf": 228000,
      "taux": 2850
    },
    "dates": {
      "generation": "2024-01-15T10:30:00Z",
      "expiration": "2024-02-14T10:30:00Z"
    },
    "instructions": [
      "Présentez ce bon à la caisse de l'université",
      "Munissez-vous de votre carte d'étudiant",
      "Le bon expire dans 30 jours"
    ]
  }
}
```

### GET `/api/frais/historique/:etudiant_id`
Obtenir l'historique détaillé avec pagination

**Paramètres de requête:**
- `page` (défaut: 1)
- `limit` (défaut: 10)
- `statut` (optionnel: VALIDE, EN_ATTENTE, ECHEC)
- `type_frais` (optionnel: ID du type de frais)

**Réponse:**
```json
{
  "success": true,
  "historique": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "statistiques": {
    "globales": {
      "total_paiements": 25,
      "montant_total_usd": 450.00,
      "paiements_valides": 20,
      "paiements_en_attente": 3,
      "paiements_echec": 2
    },
    "parType": [...]
  }
}
```

## 📄 Génération PDF et QR Codes

### POST `/api/pdf/recu/:paiementId`
Générer un reçu PDF avec QR Code de vérification

**Réponse:**
```json
{
  "success": true,
  "message": "Reçu PDF généré avec succès",
  "fileName": "recu_15_1703123456789.pdf",
  "downloadUrl": "/api/pdf/download/recu_15_1703123456789.pdf"
}
```

### GET `/api/pdf/download/:fileName`
Télécharger un fichier PDF généré

### GET `/api/pdf/verify/:paiementId`
Vérifier un paiement via QR Code

**Réponse:**
```json
{
  "valid": true,
  "paiement": {
    "id": 15,
    "etudiant": "Jean MUKENDI",
    "matricule": "SI2024001",
    "typeFrais": "Frais d'inscription",
    "montant": 150.00,
    "statut": "VALIDE",
    "datePaiement": "2024-01-15T10:30:00Z"
  }
}
```

## 🔧 Administration

### PUT `/api/frais/valider-bon/:bonId`
Valider un bon de paiement (pour l'administration)

```json
{
  "valide": true,
  "notes": "Paiement effectué à la caisse principale"
}
```

## 📊 Codes de Statut

### Statuts de Paiement
- `VALIDE` - Paiement confirmé et validé
- `EN_ATTENTE` - En attente de validation (bons physiques)
- `ECHEC` - Paiement échoué
- `ANNULE` - Paiement ou bon annulé

### Statuts de Frais
- `PAYE` - Frais entièrement payé
- `PARTIEL` - Frais partiellement payé
- `NON_PAYE` - Frais non payé
- `COMPLET` - Frais complètement soldé

### Modes de Paiement
- `MOBILE_MONEY` - Paiement mobile (Airtel Money, Orange Money, etc.)
- `CARTE_BANCAIRE` - Paiement par carte bancaire
- `BON_PHYSIQUE` - Bon de paiement physique à présenter en caisse

## 🧠 Logique Intelligente

### Reconnaissance Automatique de Faculté
Le système reconnaît automatiquement la faculté depuis le matricule :

| Code | Faculté |
|------|---------|
| **SI** | Sciences Informatiques |
| **DR** | Droit |
| **MD** | Médecine |
| **GC** | Génie Civil |
| **EC** | Économie |

### Validation Automatique
- Vérification de la correspondance faculté/frais
- Contrôle des montants (ne peut dépasser le frais)
- Prévention des sur-paiements
- Gestion des paiements partiels

### Taux de Change Dynamique
Le système utilise un taux de change configurable (défaut: 1 USD = 2850 CDF) stocké dans la table `Config`.

## 🚀 Démarrage Rapide

```bash
# Démarrer le système complet
start-complete.bat

# Ou manuellement
cd server
npm install
node init-advanced-db.js
npm run dev
```

Le serveur démarre sur **http://localhost:5000** 🎉
# 📄 Guide d'utilisation - Génération de Bons PDF

## 🚀 Installation et Configuration

### 1. Installer les dépendances
```bash
# Exécuter le script d'installation
install-pdf-deps.bat

# Ou manuellement
cd server
npm install pdfkit qrcode
```

### 2. Initialiser la base de données
```bash
cd server
node init-advanced-db.js
```

## 📡 API Endpoints

### 1. Générer un bon de paiement PDF
**POST** `/api/pdf-bon/generer`

```json
{
  "etudiant_id": 1,
  "type_frais_id": 1,
  "montant_usd": 150.00
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Bon de paiement PDF généré avec succès",
  "bon": {
    "id": 15,
    "bon_id": "BON456WXYZ",
    "fileName": "bon_BON456WXYZ_1703123456789.pdf",
    "downloadUrl": "/api/pdf-bon/download/bon_BON456WXYZ_1703123456789.pdf",
    "etudiant": {
      "nom": "Jean MUKENDI",
      "matricule": "SI2024001",
      "faculte": "Sciences Informatiques",
      "email": "jean.mukendi@upc.ac.cd"
    },
    "frais": {
      "nom": "Frais d'inscription",
      "description": "Frais d'inscription annuelle"
    },
    "montant": {
      "usd": 150.00,
      "cdf": 427500,
      "taux": 2850
    },
    "dates": {
      "generation": "2024-01-15T10:30:00Z",
      "expiration": "2024-02-14T10:30:00Z"
    }
  }
}
```

### 2. Télécharger un bon PDF
**GET** `/api/pdf-bon/download/:fileName`

Exemple: `GET /api/pdf-bon/download/bon_BON456WXYZ_1703123456789.pdf`

### 3. Lister les bons d'un étudiant
**GET** `/api/pdf-bon/etudiant/:etudiant_id`

**Réponse:**
```json
{
  "success": true,
  "bons": [
    {
      "id": 15,
      "bon_id": "BON456WXYZ",
      "montant_usd": 150.00,
      "montant_cdf": 427500,
      "statut": "EN_ATTENTE",
      "date_paiement": "2024-01-15T10:30:00Z",
      "date_expiration": "2024-02-14T10:30:00Z",
      "expire_bientot": false,
      "type_frais_nom": "Frais d'inscription",
      "etudiant_nom": "Jean MUKENDI"
    }
  ]
}
```

## 🧪 Tests

### Test automatique
```bash
cd server
node test-bon-pdf.js
```

### Test avec curl
```bash
# 1. Générer un bon
curl -X POST http://localhost:5000/api/pdf-bon/generer \
  -H "Content-Type: application/json" \
  -d '{
    "etudiant_id": 1,
    "type_frais_id": 1,
    "montant_usd": 150.00
  }'

# 2. Lister les bons d'un étudiant
curl http://localhost:5000/api/pdf-bon/etudiant/1

# 3. Télécharger un bon (remplacer par le vrai nom de fichier)
curl -O http://localhost:5000/api/pdf-bon/download/bon_BON456WXYZ_1703123456789.pdf
```

## 📋 Contenu du PDF généré

Le bon PDF contient :

### 📄 En-tête officiel
- Logo et nom de l'université
- Titre "BON DE PAIEMENT PHYSIQUE"
- Numéro de bon unique
- Dates de génération et d'expiration

### 👤 Informations étudiant
- Nom complet
- Matricule
- Faculté
- Email

### 💰 Détails du paiement
- Type de frais
- Description
- Montant en USD et CDF
- Taux de change appliqué

### 📋 Instructions de paiement
1. Présenter le bon à la caisse ou banque partenaire
2. Se munir de la carte étudiant et pièce d'identité
3. Effectuer le paiement du montant exact
4. Conserver le reçu bancaire
5. QR Code pour vérification d'authenticité
6. Expiration dans 30 jours

### ⚠️ Avertissements
- Bon personnel et non transférable
- Aucun remboursement après paiement
- Contact administration en cas de perte

### 🔍 QR Code de vérification
Contient :
- ID du bon
- Matricule étudiant
- Montants USD et CDF
- Date de génération
- URL de vérification

## 🔧 Fonctionnalités avancées

### Validation automatique
- Vérification faculté/frais
- Contrôle des montants
- Prévention des doublons
- Gestion des dates d'expiration

### Sécurité
- ID de bon unique avec checksum
- QR Code de vérification
- Traçabilité complète
- Horodatage sécurisé

### Gestion des fichiers
- Stockage dans `/server/uploads/`
- Nommage unique des fichiers
- Téléchargement sécurisé
- Nettoyage automatique (à implémenter)

## 🚨 Gestion des erreurs

### Erreurs courantes
- `400` : Données manquantes ou invalides
- `404` : Étudiant ou frais introuvable
- `500` : Erreur de génération PDF

### Validations
- Correspondance faculté/frais
- Montant ne dépassant pas le frais
- Étudiant existant et actif
- Type de frais actif

## 📊 Monitoring

### Logs générés
- Génération de bons
- Téléchargements
- Erreurs de validation
- Statistiques d'utilisation

### Métriques disponibles
- Nombre de bons générés
- Montants totaux
- Taux de téléchargement
- Bons expirés

## 🔄 Intégration

### Avec le frontend React
```javascript
// Générer un bon
const response = await fetch('/api/pdf-bon/generer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    etudiant_id: 1,
    type_frais_id: 1,
    montant_usd: 150.00
  })
});

const data = await response.json();
if (data.success) {
  // Télécharger automatiquement
  window.open(data.bon.downloadUrl, '_blank');
}
```

### Avec d'autres systèmes
- API REST standard
- Format JSON
- Codes de statut HTTP
- Documentation OpenAPI (à venir)
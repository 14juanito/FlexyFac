# 🚀 Guide d'Installation FlexyFac

## Prérequis

### 1. Node.js (OBLIGATOIRE)
- **Télécharger** : https://nodejs.org/
- **Version recommandée** : LTS (20.x ou supérieur)
- **Vérification** : `node --version` et `npm --version`

### 2. MySQL (OBLIGATOIRE)
- **Télécharger** : https://dev.mysql.com/downloads/installer/
- Ou XAMPP : https://www.apachefriends.org/

### 3. Git (Optionnel)
- **Télécharger** : https://git-scm.com/

---

## 📦 Installation Manuelle

### Étape 1 : Installer les dépendances
```bash
cd server
npm install
```

### Étape 2 : Configurer l'environnement
```bash
# Copier le fichier d'exemple
copy .env.example .env

# Éditer .env avec vos paramètres MySQL
```

### Étape 3 : Créer la base de données
```bash
# Ouvrir MySQL
mysql -u root -p

# Importer le schéma
source schema.sql
# OU
mysql -u root -p < schema.sql
```

### Étape 4 : Démarrer le serveur
```bash
npm run dev
```

---

## ⚡ Installation Rapide (Windows)

Double-cliquez sur `start.bat` à la racine du projet.

---

## 🧪 Tester l'API

### Vérifier que le serveur fonctionne
```bash
curl http://localhost:5000/health
```

### Tester la connexion
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"matricule\":\"SI2024001\"}"
```

### Vérifier un matricule
```bash
curl http://localhost:5000/api/auth/check-matricule/SI2024001
```

---

## ❌ Résolution des problèmes

### Erreur : "npm n'est pas reconnu"
➡️ Node.js n'est pas installé ou pas dans le PATH
- Réinstallez Node.js
- Redémarrez votre terminal

### Erreur : "Cannot connect to MySQL"
➡️ Vérifiez que MySQL est démarré
- XAMPP : Démarrez Apache et MySQL
- Vérifiez les paramètres dans `.env`

### Erreur : "Port 5000 already in use"
➡️ Changez le port dans `.env`
```
PORT=3000
```

---

## 📚 Prochaines étapes

Une fois le serveur démarré :
1. ✅ Testez les routes API
2. 🎨 Passez au Frontend React (Sprint suivant)
3. 💳 Implémentez la logique de paiement (Sprint 2)

---

## 🆘 Support

En cas de problème, vérifiez :
- Node.js version : `node --version` (≥ 18.x)
- MySQL status : Service démarré
- Logs du serveur : Consultez la console

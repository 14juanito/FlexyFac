# 🚀 Guide de Déploiement FlexyFac

## ✅ Avantages SQLite

- ✅ **Zéro configuration** - Pas de serveur MySQL à installer
- ✅ **Fichier unique** - Base de données = 1 fichier `.db`
- ✅ **Portable** - Copiez le fichier, c'est tout !
- ✅ **Rapide** - Parfait pour petites/moyennes applications
- ✅ **Facile à déployer** - Fonctionne partout où Node.js fonctionne

---

## 📦 Déploiement Local

```bash
cd server
npm install
npm run dev
```

C'est tout ! La base de données est créée automatiquement.

---

## ☁️ Déploiement Cloud

### Option 1 : Render.com (Gratuit)

1. Créez un compte sur https://render.com
2. Connectez votre repo GitHub
3. Créez un **Web Service**
4. Configuration :
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm run init-db && npm start`
   - Environment: Node

### Option 2 : Railway.app (Gratuit)

1. https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Sélectionnez votre repo
4. Railway détecte automatiquement Node.js

### Option 3 : Vercel (Serverless)

```bash
npm install -g vercel
cd server
vercel
```

### Option 4 : Heroku

```bash
heroku create flexyfac
git push heroku main
```

---

## 📁 Structure de déploiement

```
FlexyFac/
├── server/
│   ├── flexyfac.db          ← Base de données (créée auto)
│   ├── node_modules/
│   ├── package.json
│   └── index.js
└── client/                   ← Frontend (Sprint suivant)
```

---

## 🔄 Migration de données

Pour copier la base vers un autre serveur :

```bash
# Copier le fichier
copy server\flexyfac.db nouveau-serveur\server\

# Ou exporter en SQL
sqlite3 flexyfac.db .dump > backup.sql
```

---

## 🔒 Production

Pour la production, ajoutez dans `.env` :

```
NODE_ENV=production
PORT=5000
```

---

## 📊 Monitoring

La base SQLite peut gérer :
- ✅ Milliers d'étudiants
- ✅ Centaines de requêtes/seconde
- ✅ Plusieurs Go de données

**Si vous dépassez 100 000 utilisateurs**, migrez vers PostgreSQL.

---

## 🆘 Support

Base de données corrompue ? Supprimez `flexyfac.db` et relancez :

```bash
npm run init-db
```

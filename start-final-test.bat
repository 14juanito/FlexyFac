@echo off
echo 🔧 Correction Finale - Admin et Étudiants
echo.

cd server

echo 📊 Correction base de données...
node fix-admin-db.js

echo.
echo 🚀 Démarrage serveur...
start "FlexyFac Server" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo 🎨 Démarrage client...
cd ../client
start "FlexyFac Client" cmd /k "npm run dev"

echo.
echo ✅ FlexyFac corrigé et démarré!
echo.
echo 🎯 Tests à effectuer:
echo.
echo 👨‍🎓 CÔTÉ ÉTUDIANT:
echo    1. http://localhost:5173
echo    2. Connexion: SI2024001 / password123
echo    3. Vérifier que les frais s'affichent
echo    4. Tester formulaires paiement
echo.
echo 🔧 CÔTÉ ADMIN:
echo    1. Cliquer bouton "A" (bas droite)
echo    2. Connexion: admin / admin123
echo    3. Ajouter un nouveau frais
echo    4. Modifier le taux de change
echo    5. Retourner côté étudiant → Voir les changements
echo.
pause
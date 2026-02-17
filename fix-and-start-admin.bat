@echo off
echo 🔧 Correction et Test Admin - FlexyFac
echo.

cd server

echo 📊 Correction de la base de données...
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
echo ✅ FlexyFac Admin corrigé et démarré!
echo.
echo 🌐 Application: http://localhost:5173
echo 🔧 Admin: Bouton "A" → admin/admin123
echo.
pause
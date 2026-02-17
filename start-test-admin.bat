@echo off
echo 🔧 Démarrage Test Admin - FlexyFac
echo.

echo 📊 Initialisation base de données...
cd server
if not exist "flexyFac.db" (
    echo Création de la base de données...
    node init-db.js
)

echo.
echo 🚀 Démarrage serveur backend...
start "FlexyFac Server" cmd /k "npm run dev"

echo ⏳ Attente démarrage serveur...
timeout /t 5 /nobreak > nul

echo.
echo 🎨 Démarrage client frontend...
cd ../client
start "FlexyFac Client" cmd /k "npm run dev"

echo.
echo ✅ FlexyFac démarré!
echo.
echo 🌐 Application: http://localhost:5173
echo 🔧 Accès Admin:
echo    1. Cliquer sur le bouton "A" (bas droite)
echo    2. OU appuyer Ctrl+Shift+A
echo    3. Username: admin
echo    4. Password: admin123
echo.
echo 🧪 Pour tester l'API admin:
echo    Exécuter: test-admin-api.bat
echo.
pause
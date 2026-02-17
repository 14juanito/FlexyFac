@echo off
echo ========================================
echo    FLEXYFAC - DEMARRAGE COMPLET
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Verification des dependances...
cd server
if not exist node_modules (
    echo Installation des dependances serveur...
    npm install
)

echo.
echo [2/4] Initialisation de la base de donnees...
node init-advanced-db.js

echo.
echo [3/4] Test des fonctionnalites...
node test-features.js

echo.
echo [4/4] Demarrage du serveur...
echo.
echo ========================================
echo  SERVEUR FLEXYFAC DEMARRE
echo  URL: http://localhost:5000
echo  API: http://localhost:5000/api
echo ========================================
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.

npm run dev

pause
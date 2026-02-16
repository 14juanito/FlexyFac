@echo off
echo ========================================
echo FlexyFac - Installation et Demarrage
echo ========================================
echo.

echo [1/4] Verification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe
    echo Telechargez-le sur https://nodejs.org/
    pause
    exit /b 1
)
echo OK - Node.js installe

echo.
echo [2/4] Installation des dependances...
cd server
call npm install

echo.
echo [3/4] Configuration de l'environnement...
if not exist .env (
    copy .env.example .env
    echo Fichier .env cree - Configurez vos parametres DB
)

echo.
echo [4/4] Demarrage du serveur...
echo.
echo ========================================
echo Serveur demarre sur http://localhost:5000
echo ========================================
call npm run dev

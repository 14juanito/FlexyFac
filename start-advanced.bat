@echo off
echo 🚀 Démarrage FlexyFac - Version Avancée
echo.

echo 📊 Initialisation de la base de données avancée...
cd server
node init-advanced-db.js

echo.
echo 🔧 Démarrage du serveur backend...
start "FlexyFac Backend" cmd /k "npm run dev"

echo.
echo ⏳ Attente du démarrage du serveur (5 secondes)...
timeout /t 5 /nobreak > nul

echo.
echo 🎨 Démarrage du client frontend...
cd ../client
start "FlexyFac Frontend" cmd /k "npm run dev"

echo.
echo ✅ FlexyFac Avancé démarré!
echo 📡 Backend: http://localhost:5000
echo 🎨 Frontend: http://localhost:5173
echo.
echo 💡 Comptes de test:
echo    SI2024001 / password123 (Sciences Informatiques)
echo    DR2024002 / password123 (Droit)
echo    MD2024003 / password123 (Médecine)
echo.
pause
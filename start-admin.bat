@echo off
echo 🔧 FlexyFac - Test Dashboard Admin
echo.

echo 📊 Vérification de la base de données...
cd server
if not exist "flexyFac_advanced.db" (
    echo Initialisation de la base de données...
    node init-advanced-db.js
)

echo.
echo 🚀 Démarrage du serveur...
start "FlexyFac Server" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo 🎨 Démarrage du client...
cd ../client
start "FlexyFac Client" cmd /k "npm run dev"

echo.
echo ✅ FlexyFac démarré avec interface admin!
echo.
echo 🌐 Application: http://localhost:5173
echo 🔧 Accès Admin: 
echo    - Bouton "A" en bas à droite
echo    - Raccourci: Ctrl+Shift+A
echo    - Identifiants: admin / admin123
echo.
echo 💡 Fonctionnalités Admin:
echo    ✓ Modifier le taux USD/CDF
echo    ✓ Gérer les frais par faculté
echo    ✓ Ajouter nouveaux frais
echo    ✓ Statistiques système
echo.
pause
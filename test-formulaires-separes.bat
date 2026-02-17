@echo off
echo 🎯 Test Formulaires Séparés - FlexyFac
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
echo ✅ FlexyFac avec formulaires séparés démarré!
echo.
echo 🌐 Application: http://localhost:5173
echo 🔑 Connexion: SI2024001 / password123
echo.
echo 💡 Nouveaux Formulaires:
echo    🟢 Paiement en Ligne (bouton vert)
echo       ├─ Visa / MasterCard
echo       ├─ Mobile Money
echo       └─ Paiement instantané
echo.
echo    🟠 Bon de Paiement (bouton orange)  
echo       ├─ PDF avec QR Code
echo       ├─ Paiement physique banque
echo       └─ Pas de mode de paiement
echo.
echo 🎯 Test à effectuer:
echo    1. Se connecter avec SI2024001
echo    2. Cliquer "Paiement en Ligne" (vert)
echo    3. Sélectionner un frais → Voir USD/CDF
echo    4. Tester "PAYER EN LIGNE"
echo    5. Fermer et cliquer "Bon de Paiement" (orange)
echo    6. Sélectionner un frais → Voir USD/CDF
echo    7. Tester "GÉNÉRER BON DE PAIEMENT"
echo.
pause
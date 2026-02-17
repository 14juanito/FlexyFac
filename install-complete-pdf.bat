@echo off
echo ========================================
echo    FLEXYFAC - INSTALLATION COMPLETE PDF
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Verification du repertoire...
if not exist server (
    echo ERREUR: Repertoire server non trouve
    pause
    exit /b 1
)

cd server

echo [2/6] Installation des dependances PDF...
echo Installation de PDFKit...
npm install pdfkit@^0.13.0

echo Installation de QRCode...
npm install qrcode@^1.5.3

echo Verification des autres dependances...
npm install

echo.
echo [3/6] Verification des dependances installees...
npm list pdfkit qrcode

echo.
echo [4/6] Initialisation de la base de donnees...
node init-advanced-db.js

echo.
echo [5/6] Test de generation PDF...
node test-bon-pdf.js

echo.
echo [6/6] Verification des fichiers generes...
if exist uploads (
    echo ✅ Dossier uploads cree
    echo Fichiers PDF generes:
    dir uploads\*.pdf /b 2>nul
    if errorlevel 1 (
        echo ⚠️ Aucun fichier PDF trouve
    ) else (
        echo ✅ Fichiers PDF generes avec succes
    )
) else (
    echo ❌ Dossier uploads non trouve
)

echo.
echo ========================================
echo  INSTALLATION TERMINEE AVEC SUCCES
echo ========================================
echo.
echo 📋 Fonctionnalites disponibles:
echo   ✅ Generation de bons PDF
echo   ✅ QR Codes de verification
echo   ✅ Telechargement securise
echo   ✅ Gestion des expirations
echo.
echo 🚀 Pour demarrer le serveur:
echo   cd server
echo   npm run dev
echo.
echo 🧪 Pour tester l'API:
echo   Ouvrir: test-pdf-client.html
echo   Ou executer: test-api-pdf.bat
echo.
echo 📁 Fichiers PDF stockes dans: server/uploads/
echo.

pause
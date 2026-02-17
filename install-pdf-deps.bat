@echo off
echo ========================================
echo    FLEXYFAC - GENERATION BONS PDF
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Verification et installation des dependances...
cd server

echo Verification de PDFKit...
npm list pdfkit >nul 2>&1
if errorlevel 1 (
    echo Installation de PDFKit...
    npm install pdfkit@^0.13.0
)

echo Verification de QRCode...
npm list qrcode >nul 2>&1
if errorlevel 1 (
    echo Installation de QRCode...
    npm install qrcode@^1.5.3
)

echo Verification des autres dependances...
if not exist node_modules (
    echo Installation complete des dependances...
    npm install
)

echo.
echo [2/4] Initialisation de la base de donnees...
node init-advanced-db.js

echo.
echo [3/4] Test de generation de bons PDF...
node test-bon-pdf.js

echo.
echo [4/4] Verification des fichiers generes...
if exist uploads (
    echo Fichiers PDF generes:
    dir uploads\*.pdf /b 2>nul
    if errorlevel 1 (
        echo Aucun fichier PDF trouve
    )
) else (
    echo Dossier uploads non trouve
)

echo.
echo ========================================
echo  GENERATION PDF TERMINEE
echo  Dossier: server/uploads/
echo ========================================
echo.

pause
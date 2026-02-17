@echo off
echo ========================================
echo    TEST API BONS PDF - FLEXYFAC
echo ========================================
echo.

cd /d "%~dp0\server"

echo [1/3] Initialisation de la base de donnees...
node init-advanced-db.js

echo.
echo [2/3] Demarrage du serveur en arriere-plan...
start /B npm run dev

echo Attente du demarrage du serveur...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Test des API avec curl...
echo.

echo Test 1: Generation d'un bon PDF
curl -X POST http://localhost:5000/api/pdf-bon/generer ^
  -H "Content-Type: application/json" ^
  -d "{\"etudiant_id\": 1, \"type_frais_id\": 1, \"montant_usd\": 150.00}"

echo.
echo.
echo Test 2: Liste des bons d'un etudiant
curl http://localhost:5000/api/pdf-bon/etudiant/1

echo.
echo.
echo Test 3: Verification de l'API de sante
curl http://localhost:5000/health

echo.
echo.
echo ========================================
echo  TESTS TERMINES
echo  Serveur: http://localhost:5000
echo  Fichiers PDF: server/uploads/
echo ========================================
echo.
echo Appuyez sur une touche pour arreter le serveur...
pause >nul

echo Arret du serveur...
taskkill /F /IM node.exe >nul 2>&1

echo Serveur arrete.
pause
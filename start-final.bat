@echo off
echo ========================================
echo    FLEXYFAC - DEMARRAGE FINAL
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Preparation du serveur...
cd server
node init-advanced-db.js
echo.

echo [2/3] Test rapide des APIs...
node test-api-quick.js
echo.

echo [3/3] Demarrage du serveur...
echo.
echo ========================================
echo  SERVEUR FLEXYFAC PRET
echo  Backend: http://localhost:5000
echo  Frontend: http://localhost:5173
echo ========================================
echo.
echo Fonctionnalites disponibles:
echo ✅ Authentification par matricule
echo ✅ Dashboard avec infos etudiant
echo ✅ Generation de bons PDF
echo ✅ Calcul des frais avances
echo.
echo Etudiants de test:
echo - SI2024001 (Jean MUKENDI - Sciences Informatiques)
echo - DR2024002 (Marie TSHIMANGA - Droit)
echo - MD2024003 (Pierre KABONGO - Medecine)
echo.

start /B npm run dev

echo Serveur demarre en arriere-plan
echo Appuyez sur une touche pour arreter...
pause >nul

echo Arret du serveur...
taskkill /F /IM node.exe >nul 2>&1
echo Serveur arrete.
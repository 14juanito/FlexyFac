@echo off
echo ========================================
echo FlexyFac - Demarrage Complet
echo ========================================
echo.

echo [1/2] Demarrage du Backend...
start cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/2] Demarrage du Frontend...
start cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause >nul

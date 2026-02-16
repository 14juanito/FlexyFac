@echo off
echo ========================================
echo FlexyFac - Push vers GitHub
echo ========================================
echo.

echo [1/5] Configuration Git...
set /p USERNAME="Entrez votre nom (ex: John Doe): "
set /p EMAIL="Entrez votre email GitHub: "

git config --global user.name "%USERNAME%"
git config --global user.email "%EMAIL%"
echo OK - Identite configuree

echo.
echo [2/5] Initialisation du depot...
git init
git add .

echo.
echo [3/5] Creation du commit...
git commit -m "Initial commit: FlexyFac - Backend avec SQLite et authentification intelligente"

echo.
echo [4/5] Creation du repo sur GitHub...
echo.
echo IMPORTANT: Allez sur https://github.com/new
echo Creez un nouveau repo nomme: FlexyFac
echo NE cochez PAS "Initialize with README"
echo.
pause

echo.
echo [5/5] Push vers GitHub...
set /p GITHUB_URL="Collez l'URL de votre repo (ex: https://github.com/username/FlexyFac.git): "

git branch -M main
git remote add origin %GITHUB_URL%
git push -u origin main

echo.
echo ========================================
echo Push termine avec succes !
echo Votre code est sur GitHub
echo ========================================
pause

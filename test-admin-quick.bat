@echo off
echo 🔧 Test Rapide Admin
echo.

cd server
echo 📊 Exécution fix-admin-db...
node fix-admin-db.js

echo.
echo 🧪 Test API admin...
echo Démarrage serveur en arrière-plan...
start /B npm run dev

timeout /t 3 /nobreak > nul

echo.
echo Test connexion admin:
curl -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

echo.
echo.
echo Test récupération frais:
curl -X GET http://localhost:5000/api/admin/frais

echo.
echo.
echo ✅ Si pas d'erreurs 500, l'admin fonctionne!
pause
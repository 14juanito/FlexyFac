@echo off
echo 🔧 Test Connexion Admin - FlexyFac
echo.

echo 📊 Test de l'API admin...
cd server

echo.
echo 🧪 Test 1: Route de santé
curl -X GET http://localhost:5000/health
echo.

echo.
echo 🧪 Test 2: Connexion admin
curl -X POST http://localhost:5000/api/admin/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
echo.

echo.
echo 🧪 Test 3: Récupération des frais
curl -X GET http://localhost:5000/api/admin/frais
echo.

echo.
echo 🧪 Test 4: Taux de change
curl -X GET http://localhost:5000/api/admin/taux-change
echo.

echo.
echo 🧪 Test 5: Statistiques
curl -X GET http://localhost:5000/api/admin/stats
echo.

echo.
echo ✅ Tests terminés!
echo 💡 Si les tests échouent, vérifiez que le serveur est démarré
pause
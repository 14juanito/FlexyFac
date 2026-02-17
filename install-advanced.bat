@echo off
echo 🔧 Installation des dépendances avancées pour FlexyFac...

cd server
echo 📦 Installation des dépendances backend...
npm install pdfkit qrcode jsonwebtoken bcrypt

cd ../client  
echo 📦 Installation des dépendances frontend...
npm install framer-motion react-hot-toast lucide-react

echo ✅ Installation terminée!
echo 🚀 Vous pouvez maintenant utiliser le formulaire avancé
pause
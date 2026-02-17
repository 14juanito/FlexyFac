import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminApp from './components/AdminApp';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Restaurer la session au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Valider les champs essentiels (pour Ã©viter les sessions corrompues)
        if (parsed?.matricule && parsed?.nom && parsed?.prenom) {
          setUser(parsed);
        } else {
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Erreur lors de la restauration de la session:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Accès admin via URL ou raccourci clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Chargement de FlexyFac...</p>
        </div>
      </div>
    );
  }

  // Interface Admin
  if (showAdmin) {
    return (
      <div>
        <AdminApp />
        <button
          onClick={() => setShowAdmin(false)}
          className="fixed top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm z-50"
        >
          Retour App
        </button>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {!user ? (
          <Login key="login" onLogin={handleLogin} />
        ) : (
          <Dashboard key="dashboard" user={user} onLogout={handleLogout} />
        )}
      </AnimatePresence>
      
      {/* Bouton d'accès admin discret */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-4 right-4 w-8 h-8 bg-red-600 text-white rounded-full text-xs opacity-20 hover:opacity-100 transition-opacity"
        title="Admin (Ctrl+Shift+A)"
      >
        A
      </button>
    </div>
  );
}

export default App;

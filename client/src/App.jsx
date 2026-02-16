import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur lors de la restauration de la session:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
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

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <Login key="login" onLogin={handleLogin} />
      ) : (
        <Dashboard key="dashboard" user={user} onLogout={handleLogout} />
      )}
    </AnimatePresence>
  );
}

export default App;

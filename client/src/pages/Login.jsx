import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, User, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function Login({ onLogin }) {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(matricule);
      if (data.success) {
        toast.success('Connexion réussie!');
        setTimeout(() => onLogin(data), 500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur de connexion';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testMatricules = ['SI2024001', 'DR2024002', 'MD2024003'];

  const handleTestLogin = (testMatricule) => {
    setMatricule(testMatricule);
    toast.success(`Matricule ${testMatricule} sélectionné`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-4">
      <Toaster position="top-center" />
      
      {/* Particules d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white bg-opacity-10 rounded-full"
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="card max-w-md w-full relative z-10"
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FlexyFac</h1>
          <p className="text-gray-600">Université Protestante du Congo</p>
          <div className="w-20 h-1 bg-primary-600 rounded-full mx-auto mt-3"></div>
        </motion.div>

        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              Matricule Étudiant
            </label>
            <div className="relative">
              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                placeholder="Ex: SI2024001"
                className="input-field pl-12"
                required
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <CheckCircle size={12} />
              Format: 2 lettres + 4 chiffres + numéro
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 relative overflow-hidden"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Connexion en cours...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Comptes de test */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600 mb-3">Comptes de démonstration :</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {testMatricules.map((testMatricule, index) => (
              <motion.button
                key={testMatricule}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => handleTestLogin(testMatricule)}
                className="bg-gray-100 hover:bg-primary-100 hover:text-primary-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {testMatricule}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-xs text-gray-500"
        >
          <p>© 2024 FlexyFac - Gestion intelligente des frais universitaires</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

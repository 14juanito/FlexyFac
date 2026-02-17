import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Download,
  LogOut,
  Plus,
  Calendar,
  Building
} from 'lucide-react';
import { authService } from '../services/api';
import PaymentForm from '../components/PaymentForm';
import GenerateBonForm from '../components/GenerateBonForm';
import PaymentConfirmation from '../components/PaymentConfirmation';
import PaymentSuccess from '../components/PaymentSuccess';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard({ user, onLogout }) {
  const [frais, setFrais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateBon, setShowGenerateBon] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [etudiant, setEtudiant] = useState(user || {});

  useEffect(() => {
    setEtudiant(user || {});
    if (user?.matricule || user?.etudiant?.matricule) {
      loadFrais();
    }
  }, [user]);

  const loadFrais = async () => {
    const matricule = user?.matricule || user?.etudiant?.matricule;
    if (!matricule || matricule === 'undefined') {
      console.error('Matricule manquant pour charger les frais');
      setLoading(false);
      return;
    }
    try {
      const data = await authService.getFrais(matricule);
      if (data.success) {
        setFrais(data.frais || []);

        // Mettre à jour les infos étudiant avec les dernières données backend
        const mergedUser = {
          ...user,
          ...data.etudiant,
          faculte: data.etudiant?.faculte || user?.faculte,
          promotion: data.etudiant?.promotion || user?.promotion,
          typesFrais: data.frais || user?.typesFrais || [],
          tauxChange: data.tauxChange || user?.tauxChange || 2850
        };

        setEtudiant(mergedUser);
        // Synchroniser le stockage local pour les prochaines sessions
        try {
          localStorage.setItem('user', JSON.stringify(mergedUser));
        } catch (e) {
          console.warn('Impossible de mettre à jour la session locale:', e);
        }
      } else {
        // Fallback: utiliser les typesFrais retournés lors de la connexion
        const sourceUser = etudiant || user || {};
        if (sourceUser.typesFrais && sourceUser.typesFrais.length > 0) {
          setFrais(sourceUser.typesFrais.map(f => ({
            ...f,
            montant: f.montant_usd,
            montant_usd: f.montant_usd,
            description: f.description || f.nom
          })));
        }
      }
    } catch (error) {
      console.error('Erreur chargement frais:', error);
      // Fallback: utiliser les typesFrais retournés lors de la connexion
      const sourceUser = etudiant || user || {};
      if (sourceUser.typesFrais && sourceUser.typesFrais.length > 0) {
        setFrais(sourceUser.typesFrais.map(f => ({
          ...f,
          montant: f.montant_usd,
          montant_usd: f.montant_usd,
          description: f.description || f.nom
        })));
      } else {
        toast.error('Erreur lors du chargement des frais');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalFrais = frais.reduce((sum, f) => sum + parseFloat(f.montant_usd || 0), 0);

  const handlePaymentFormSubmit = (formData) => {
    setPaymentData(formData);
    setShowPaymentForm(false);
    setShowConfirmation(true);
  };

  const handlePaymentConfirm = () => {
    setShowConfirmation(false);
    // Simulation du traitement du paiement
    setTimeout(() => {
      setShowSuccess(true);
      toast.success('Paiement traité avec succès!');
    }, 1500);
  };

  const handleDownloadReceipt = () => {
    toast.success('Téléchargement du reçu en cours...');
    // Logique de téléchargement du PDF
  };

  const handlePaySingleFee = (fee) => {
    setPaymentData({
      matricule: etudiant.matricule,
      nomComplet: `${etudiant.prenom} ${etudiant.nom}`,
      typePaiement: 'frais_academique',
      montant: fee.montant,
      modePaiement: 'mobile_money'
    });
    setShowConfirmation(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FlexyFac</h1>
              <p className="text-sm text-gray-600">Université Protestante du Congo</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout} 
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </motion.button>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Carte Étudiant */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card mb-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {etudiant.prenom} {etudiant.nom}
                </h2>
                <p className="text-primary-100 mb-3 flex items-center gap-2">
                  <Building size={16} />
                  Matricule: {etudiant.matricule}
                </p>
                <div className="flex gap-3">
                  <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <GraduationCap size={14} />
                    {etudiant.faculte}
                  </span>
                  <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <Calendar size={14} />
                    Promotion {etudiant.promotion || (etudiant.faculte === 'Sciences Informatiques' ? 'L1(LMD)FASI' : '2024-2025')}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary-100 text-sm mb-1">Total à payer</p>
              <p className="text-3xl font-bold flex items-center gap-2">
                <DollarSign size={28} />
                {totalFrais.toLocaleString()} 
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions rapides */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGenerateBon(true)}
            className="card hover:shadow-xl transition-all duration-200 p-6 text-center border-2 border-dashed border-orange-300 hover:border-orange-500"
          >
            <FileText className="text-orange-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Bon de Paiement</h3>
            <p className="text-sm text-gray-600">Paiement à la banque</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card hover:shadow-xl transition-all duration-200 p-6 text-center"
          >
            <Download className="text-blue-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Télécharger</h3>
            <p className="text-sm text-gray-600">Relevé des frais</p>
          </motion.button>
        </motion.div>

        {/* Liste des Frais */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-primary-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">
              Frais à payer - Année 2024-2025
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des frais...</p>
            </div>
          ) : frais.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Aucun frais trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {frais.map((f, index) => (
                <motion.div
                  key={f.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{f.nom}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Building size={14} />
                        {f.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        ${parseFloat(f.montant_usd || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">À payer</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePaySingleFee(f)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      Payer
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showGenerateBon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Générer Bon de Paiement</h2>
                  <button
                    onClick={() => setShowGenerateBon(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <GenerateBonForm 
                  user={etudiant} 
                  onBonGenerated={() => {
                    setShowGenerateBon(false);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
        
        {showConfirmation && paymentData && (
          <PaymentConfirmation
            paymentData={paymentData}
            onConfirm={handlePaymentConfirm}
            onCancel={() => setShowConfirmation(false)}
          />
        )}
        
        {showSuccess && paymentData && (
          <PaymentSuccess
            paymentData={paymentData}
            onClose={() => {
              setShowSuccess(false);
              setPaymentData(null);
            }}
            onDownloadReceipt={handleDownloadReceipt}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

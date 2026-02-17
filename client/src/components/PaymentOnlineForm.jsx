import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, User, GraduationCap, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { authService } from '../services/api';

export default function PaymentOnlineForm({ user, onPaymentSuccess }) {
  const student = user?.etudiant || user || {};
  const [selectedFrais, setSelectedFrais] = useState('');
  const [selectedMode, setSelectedMode] = useState('MOBILE_MONEY');
  const [phone, setPhone] = useState('');
  const [fraisList, setFraisList] = useState([]);
  const [tauxChange, setTauxChange] = useState(2850);
  const [loading, setLoading] = useState(false);
  const [montantUSD, setMontantUSD] = useState(0);
  const [montantCDF, setMontantCDF] = useState(0);

  useEffect(() => {
    // récupérer la liste des frais depuis l'utilisateur ou l'objet frais calculé
    const list = student?.typesFrais || student?.frais || [];
    setFraisList(list);
    if (student?.tauxChange) {
      setTauxChange(student.tauxChange);
    }

    // Si aucune donnée ou données obsolètes, rafraîchir depuis l'API pour refléter les ajouts admin
    const refreshIfEmpty = async () => {
      if (list.length === 0 && student?.matricule) {
        try {
          const data = await authService.getFrais(student.matricule);
          const latestFrais = data.frais || data.typesFrais || [];
          setFraisList(latestFrais);
          if (data.tauxChange) setTauxChange(data.tauxChange);
        } catch (error) {
          console.error('Chargement frais (form en ligne) échoué:', error);
          toast.error('Impossible de charger les types de frais');
        }
      }
    };

    refreshIfEmpty();
  }, [student]);

  useEffect(() => {
    if (selectedFrais) {
      const frais = fraisList.find((f) => f.id === parseInt(selectedFrais));
      if (frais) {
        setMontantUSD(frais.montant_usd);
        setMontantCDF(frais.montant_usd * tauxChange);
      }
    } else {
      setMontantUSD(0);
      setMontantCDF(0);
    }
  }, [selectedFrais, fraisList, tauxChange]);

  const handlePaymentOnline = async () => {
    if (!selectedFrais) {
      toast.error('Veuillez sélectionner un type de frais');
      return;
    }
    if (!selectedMode) {
      toast.error('Veuillez sélectionner un mode de paiement');
      return;
    }
    if (selectedMode === 'MOBILE_MONEY' && phone.trim().length < 9) {
      toast.error('Numéro mobile invalide');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/frais/paiement', {
        etudiant_id: student.id,
        type_frais_id: parseInt(selectedFrais, 10),
        montant_usd: montantUSD,
        mode_paiement: selectedMode,
        phone,
      });

      if (data.success) {
        toast.success('Paiement mobile initié !');
        onPaymentSuccess?.(data);
      } else {
        toast.error(data.message || 'Erreur paiement');
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Erreur de connexion';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
          <CreditCard className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paiement en Ligne</h2>
          <p className="text-gray-600">Visa, MasterCard, Mobile Money</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informations Étudiant */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User size={18} />
            Informations Étudiant
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
              <input
                type="text"
                value={`${student.nom} ${student.prenom}`}
                className="input-field bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
              <input
                type="text"
                value={student.matricule}
                className="input-field bg-gray-100"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Sélection Type de Frais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <GraduationCap size={16} />
            Type de Frais
          </label>
          <select
            value={selectedFrais}
            onChange={(e) => setSelectedFrais(e.target.value)}
            className="input-field"
            required
          >
            <option value="">-- Sélectionnez un type de frais --</option>
            {fraisList.map((frais) => (
              <option key={frais.id} value={frais.id}>
                {frais.nom} - {frais.description} (${frais.montant_usd})
              </option>
            ))}
          </select>
        </div>

        {/* Mode de paiement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <CreditCard size={16} />
            Mode de Paiement
          </label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="input-field"
            required
          >
            <option value="MOBILE_MONEY">Mobile Money (Orange/Airtel)</option>
            <option value="CARTE_BANCAIRE">Carte Bancaire (Visa/MasterCard)</option>
          </select>
        </div>

        {/* Numéro Mobile */}
        {selectedMode === 'MOBILE_MONEY' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone size={16} />
              Numéro Mobile Money
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0891234567"
              className="input-field"
              required
            />
          </div>
        )}

        {/* Affichage Montants */}
        {selectedFrais && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6"
          >
            <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <DollarSign size={18} />
              Montant à Payer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Montant en Dollars</p>
                <p className="text-3xl font-bold text-green-600">${montantUSD}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Équivalent en CDF</p>
                <p className="text-3xl font-bold text-green-600">{montantCDF.toLocaleString()} CDF</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Taux de change: 1$ = {tauxChange} CDF
            </p>
          </motion.div>
        )}

        {/* Bouton Paiement */}
        {selectedFrais && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePaymentOnline}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            {loading ? 'Traitement...' : 'PAYER EN LIGNE'}
          </motion.button>
        )}

        {/* Informations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Modes de Paiement Acceptés</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Visa / MasterCard</li>
            <li>• Mobile Money (Orange Money, Airtel Money)</li>
            <li>• Paiement sécurisé et instantané</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, FileText, User, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentFormAdvanced({ user, onPaymentSuccess }) {
  const [selectedFrais, setSelectedFrais] = useState('');
  const [fraisList, setFraisList] = useState([]);
  const [tauxChange, setTauxChange] = useState(2850);
  const [loading, setLoading] = useState(false);
  const [montantUSD, setMontantUSD] = useState(0);
  const [montantCDF, setMontantCDF] = useState(0);

  // Charger les frais de la faculté au montage
  useEffect(() => {
    if (user?.typesFrais) {
      setFraisList(user.typesFrais);
    }
    if (user?.tauxChange) {
      setTauxChange(user.tauxChange);
    }
  }, [user]);

  // Calculer automatiquement le montant CDF quand un frais est sélectionné
  useEffect(() => {
    if (selectedFrais) {
      const frais = fraisList.find(f => f.id === parseInt(selectedFrais));
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

    setLoading(true);
    try {
      // Simulation paiement en ligne
      const response = await fetch('/api/paiements/payer-en-ligne', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etudiant_id: user.etudiant.id,
          type_frais_id: selectedFrais,
          montant_usd: montantUSD,
          montant_cdf: montantCDF,
          mode_paiement: 'EN_LIGNE'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Paiement en ligne initié!');
        onPaymentSuccess?.(data);
      } else {
        toast.error(data.message || 'Erreur paiement');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBon = async () => {
    if (!selectedFrais) {
      toast.error('Veuillez sélectionner un type de frais');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/paiements/generer-bon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etudiant_id: user.etudiant.id,
          type_frais_id: selectedFrais,
          montant_usd: montantUSD,
          montant_cdf: montantCDF,
          mode_paiement: 'BON_PHYSIQUE'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bon-paiement-${user.etudiant.matricule}.pdf`;
        a.click();
        toast.success('Bon de paiement généré!');
      } else {
        toast.error('Erreur génération PDF');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
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
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
          <DollarSign className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formulaire de Paiement</h2>
          <p className="text-gray-600">Sélectionnez vos frais et procédez au paiement</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informations Étudiant (Lecture seule) */}
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
                value={`${user.etudiant.nom} ${user.etudiant.prenom}`}
                className="input-field bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
              <input
                type="text"
                value={user.etudiant.matricule}
                className="input-field bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculté</label>
              <input
                type="text"
                value={user.etudiant.faculte}
                className="input-field bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
              <input
                type="text"
                value={user.etudiant.promotion || 'Non spécifiée'}
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
                {frais.nom} - {frais.description}
              </option>
            ))}
          </select>
        </div>

        {/* Affichage Dynamique des Montants */}
        {selectedFrais && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-50 border border-primary-200 rounded-lg p-6"
          >
            <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
              <DollarSign size={18} />
              Montant à Payer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Montant en Dollars</p>
                <p className="text-3xl font-bold text-primary-600">${montantUSD}</p>
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

        {/* Boutons de Paiement */}
        {selectedFrais && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePaymentOnline}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 py-4"
            >
              <CreditCard size={20} />
              {loading ? 'Traitement...' : 'PAYER EN LIGNE'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateBon}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              {loading ? 'Génération...' : 'GÉNÉRER BON DE PAIEMENT'}
            </motion.button>
          </motion.div>
        )}

        {/* Informations Supplémentaires */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Options de Paiement</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Paiement en ligne:</strong> Visa, MasterCard, Mobile Money</li>
            <li>• <strong>Bon de paiement:</strong> À présenter à la banque pour paiement physique</li>
            <li>• Le bon contient un QR Code pour vérification par l'agent bancaire</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
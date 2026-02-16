import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, FileText, User, Hash, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    nomComplet: '',
    typePaiement: '',
    montant: '',
    modePaiement: 'mobile_money'
  });

  const typesPaiement = [
    { id: 'frais_cisnet', label: 'Frais CISNET', icon: FileText },
    { id: 'frais_academique', label: 'Frais Académiques', icon: Calendar },
    { id: 'minerval', label: 'Minerval', icon: DollarSign },
    { id: 'inscription', label: 'Frais d\'inscription', icon: User }
  ];

  const modesPaiement = [
    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
    { id: 'carte_bancaire', label: 'Carte Bancaire', icon: CreditCard }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.matricule || !formData.nomComplet || !formData.typePaiement || !formData.montant) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <FileText className="text-primary-600" size={28} />
            Générer un Bon de Paiement
          </h2>
          <p className="text-gray-600 mt-1">Remplissez les informations pour créer votre bon de paiement</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Matricule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash size={16} className="inline mr-2" />
              Matricule
            </label>
            <input
              type="text"
              value={formData.matricule}
              onChange={(e) => setFormData({...formData, matricule: e.target.value})}
              className="input-field"
              placeholder="Ex: SI2024001"
            />
          </div>

          {/* Nom Complet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Nom Complet
            </label>
            <input
              type="text"
              value={formData.nomComplet}
              onChange={(e) => setFormData({...formData, nomComplet: e.target.value})}
              className="input-field"
              placeholder="Nom et Prénom"
            />
          </div>

          {/* Type de Paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Type de Paiement</label>
            <div className="grid grid-cols-2 gap-3">
              {typesPaiement.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({...formData, typePaiement: type.id})}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      formData.typePaiement === type.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={24} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Montant (FCFA)
            </label>
            <input
              type="number"
              value={formData.montant}
              onChange={(e) => setFormData({...formData, montant: e.target.value})}
              className="input-field"
              placeholder="50000"
            />
          </div>

          {/* Mode de Paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Mode de Paiement</label>
            <div className="grid grid-cols-2 gap-3">
              {modesPaiement.map((mode) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={mode.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({...formData, modePaiement: mode.id})}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      formData.modePaiement === mode.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={24} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">{mode.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Générer le Bon
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PaymentForm;
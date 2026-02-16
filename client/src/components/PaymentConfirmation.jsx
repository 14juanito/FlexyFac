import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, Smartphone, User, Hash, DollarSign, Calendar, ArrowRight } from 'lucide-react';

const PaymentConfirmation = ({ paymentData, onConfirm, onCancel }) => {
  const getPaymentIcon = (mode) => {
    return mode === 'mobile_money' ? Smartphone : CreditCard;
  };

  const getTypeLabel = (type) => {
    const types = {
      'frais_cisnet': 'Frais CISNET',
      'frais_academique': 'Frais Académiques',
      'minerval': 'Minerval',
      'inscription': 'Frais d\'inscription'
    };
    return types[type] || type;
  };

  const getModeLabel = (mode) => {
    return mode === 'mobile_money' ? 'Mobile Money' : 'Carte Bancaire';
  };

  const PaymentIcon = getPaymentIcon(paymentData.modePaiement);

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <CheckCircle className="text-success-500" size={28} />
            Confirmer le Paiement
          </h2>
          <p className="text-gray-600 mt-1">Vérifiez les détails avant de procéder</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Résumé du paiement */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <User size={16} />
                Étudiant
              </span>
              <span className="font-medium">{paymentData.nomComplet}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Hash size={16} />
                Matricule
              </span>
              <span className="font-medium">{paymentData.matricule}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar size={16} />
                Type de frais
              </span>
              <span className="font-medium">{getTypeLabel(paymentData.typePaiement)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <PaymentIcon size={16} />
                Mode de paiement
              </span>
              <span className="font-medium">{getModeLabel(paymentData.modePaiement)}</span>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign size={20} />
                  Montant à payer
                </span>
                <span className="font-bold text-primary-600">
                  {parseInt(paymentData.montant).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Information de sécurité */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-700">
              <CheckCircle size={16} className="inline mr-2" />
              Paiement sécurisé. Vous recevrez un reçu PDF avec QR code après confirmation.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Confirmer le Paiement
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentConfirmation;
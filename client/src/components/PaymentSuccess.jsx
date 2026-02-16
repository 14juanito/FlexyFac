import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, Home, Receipt } from 'lucide-react';

const PaymentSuccess = ({ paymentData, onClose, onDownloadReceipt }) => {
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center"
      >
        <div className="p-8">
          {/* Animation de succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-success-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement Réussi !</h2>
            <p className="text-gray-600">
              Votre paiement de <span className="font-semibold text-success-600">
                {parseInt(paymentData.montant).toLocaleString()} FCFA
              </span> a été traité avec succès.
            </p>
          </motion.div>

          {/* Détails de la transaction */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Receipt size={18} className="text-gray-600" />
              <span className="font-medium text-gray-900">Détails de la transaction</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Référence:</span>
                <span className="font-mono font-medium">TXN{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heure:</span>
                <span className="font-medium">{new Date().toLocaleTimeString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownloadReceipt}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Télécharger le Reçu PDF
            </motion.button>

            <div className="flex gap-3">
              <button
                onClick={() => {/* Logique de partage */}}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Partager
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Accueil
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentSuccess;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, FileText, User, GraduationCap, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GenerateBonForm({ user, onBonGenerated }) {
  const [selectedFrais, setSelectedFrais] = useState('');
  const [fraisList, setFraisList] = useState([]);
  const [tauxChange, setTauxChange] = useState(2850);
  const [loading, setLoading] = useState(false);
  const [montantUSD, setMontantUSD] = useState(0);
  const [montantCDF, setMontantCDF] = useState(0);
  const [montantEditable, setMontantEditable] = useState(false);

  useEffect(() => {
    const list = user?.typesFrais || user?.frais || [];
    setFraisList(list);
    if (user?.tauxChange) {
      setTauxChange(user.tauxChange);
    }
  }, [user]);

  useEffect(() => {
    if (selectedFrais) {
      const frais = fraisList.find(f => f.id === parseInt(selectedFrais));
      if (frais) {
        setMontantEditable(/frais acad(é|e)mique/i.test(frais.nom || ''));
        setMontantUSD(frais.montant_usd);
        setMontantCDF(frais.montant_usd * tauxChange);
      }
    } else {
      setMontantEditable(false);
      setMontantUSD(0);
      setMontantCDF(0);
    }
  }, [selectedFrais, fraisList, tauxChange]);

  const handleGenerateBon = async () => {
    if (!selectedFrais) {
      toast.error('Veuillez sélectionner un type de frais');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`}/pdf-bon/generer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etudiant_id: user.id,
          type_frais_id: parseInt(selectedFrais),
          montant_usd: montantUSD
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Télécharger le PDF
        const apiBase = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
        const baseNoApi = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
        const downloadResponse = await fetch(`${baseNoApi}${data.bon.downloadUrl}`);
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.bon.fileName;
        a.click();
        toast.success('Bon de paiement généré et téléchargé!');
        onBonGenerated?.();
      } else {
        toast.error(data.error || 'Erreur génération PDF');
      }
    } catch (error) {
      console.error('Erreur:', error);
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
        <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
          <FileText className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Générer un Bon de Paiement</h2>
          <p className="text-gray-600">Pour paiement physique à la banque</p>
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
              value={`${user.prenom} ${user.nom}`}
              className="input-field bg-gray-100"
              readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
              <input
                type="text"
                value={user.matricule}
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

        {/* Affichage Montants */}
        {selectedFrais && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-6"
          >
            <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <DollarSign size={18} />
              Montant à Payer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Montant en Dollars</p>
                {montantEditable ? (
                  <input
                    type="number"
                    min={1}
                    max={fraisList.find(f => f.id === parseInt(selectedFrais))?.montant_usd || montantUSD}
                    value={montantUSD}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMontantUSD(v);
                      setMontantCDF(v * tauxChange);
                    }}
                    className="input-field text-center font-bold text-orange-600"
                  />
                ) : (
                  <p className="text-3xl font-bold text-orange-600">${montantUSD}</p>
                )}
                {!montantEditable && (
                  <p className="text-xs text-gray-500 mt-1">Montant fixe du frais</p>
                )}
                {montantEditable && (
                  <p className="text-xs text-gray-500 mt-1">
                    Montant initial : ${fraisList.find(f => f.id === parseInt(selectedFrais))?.montant_usd || montantUSD}
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Équivalent en CDF</p>
                <p className="text-3xl font-bold text-orange-600">{montantCDF.toLocaleString()} CDF</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Taux de change: 1$ = {tauxChange} CDF
            </p>
          </motion.div>
        )}

        {/* Bouton Génération */}
        {selectedFrais && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateBon}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download size={20} />
            {loading ? 'Génération...' : 'GÉNÉRER BON DE PAIEMENT'}
          </motion.button>
        )}

        {/* Informations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Contenu du Bon de Paiement</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Informations complètes de l'étudiant</li>
            <li>• Détails du frais à payer (USD et CDF)</li>
            <li>• QR Code pour vérification par l'agent bancaire</li>
            <li>• Instructions pour le paiement physique</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  DollarSign, 
  Edit3, 
  Save, 
  Plus, 
  Users, 
  FileText, 
  CreditCard,
  LogOut 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard({ onLogout }) {
  const [frais, setFrais] = useState([]);
  const [tauxChange, setTauxChange] = useState(2850);
  const [nouveauTaux, setNouveauTaux] = useState('');
  const [stats, setStats] = useState({});
  const [editingFrais, setEditingFrais] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fraisRes, tauxRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/frais'),
        fetch('http://localhost:5000/api/admin/taux-change'),
        fetch('http://localhost:5000/api/admin/stats')
      ]);

      const fraisData = await fraisRes.json();
      const tauxData = await tauxRes.json();
      const statsData = await statsRes.json();

      setFrais(fraisData.frais || []);
      setTauxChange(tauxData.taux_usd_cdf || 2850);
      setNouveauTaux((tauxData.taux_usd_cdf || 2850).toString());
      setStats(statsData.stats || {});
    } catch (error) {
      console.error('Erreur loadData:', error);
      toast.error('Erreur lors du chargement des données');
      setFrais([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const updateTaux = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/taux-change', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nouveau_taux: parseFloat(nouveauTaux) })
      });

      if (response.ok) {
        setTauxChange(parseFloat(nouveauTaux));
        toast.success('Taux de change mis à jour!');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du taux');
    }
  };

  const updateFrais = async (id, data) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/frais/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setFrais(frais.map(f => f.id === id ? { ...f, ...data } : f));
        setEditingFrais(null);
        toast.success('Frais mis à jour!');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const addFrais = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/frais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setFrais([...frais, { ...data, id: result.id }]);
        setShowAddForm(false);
        toast.success('Frais ajouté!');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const facultes = ['Sciences Informatiques', 'Droit', 'Médecine', 'Génie Civil', 'Économie'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Settings className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin FlexyFac</h1>
              <p className="text-sm text-gray-600">Gestion des frais et configuration</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <Users className="text-blue-600 mx-auto mb-3" size={32} />
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_etudiants || 0}</h3>
            <p className="text-gray-600">Étudiants</p>
          </div>
          <div className="card p-6 text-center">
            <FileText className="text-green-600 mx-auto mb-3" size={32} />
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_frais || 0}</h3>
            <p className="text-gray-600">Types de Frais</p>
          </div>
          <div className="card p-6 text-center">
            <CreditCard className="text-purple-600 mx-auto mb-3" size={32} />
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_paiements || 0}</h3>
            <p className="text-gray-600">Paiements</p>
          </div>
        </div>

        {/* Taux de Change */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Taux de Change USD/CDF</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taux Actuel: 1$ = {tauxChange} CDF
              </label>
              <input
                type="number"
                value={nouveauTaux}
                onChange={(e) => setNouveauTaux(e.target.value)}
                className="input-field"
                placeholder="Nouveau taux"
              />
            </div>
            <button
              onClick={updateTaux}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              Mettre à jour
            </button>
          </div>
        </div>

        {/* Gestion des Frais */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FileText className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Gestion des Frais</h2>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Ajouter Frais
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-lg p-4 mb-6"
            >
              <AddFraisForm 
                facultes={facultes}
                onSubmit={addFrais}
                onCancel={() => setShowAddForm(false)}
              />
            </motion.div>
          )}

          {/* Liste des frais par faculté */}
          {facultes.map(faculte => {
            const fraisFaculte = (frais || []).filter(f => f.faculte === faculte);
            if (fraisFaculte.length === 0) return null;

            return (
              <div key={faculte} className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">{faculte}</h3>
                <div className="space-y-2">
                  {fraisFaculte.map(f => (
                    <FraisItem
                      key={f.id}
                      frais={f}
                      isEditing={editingFrais === f.id}
                      onEdit={() => setEditingFrais(f.id)}
                      onSave={(data) => updateFrais(f.id, data)}
                      onCancel={() => setEditingFrais(null)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Composant pour éditer un frais
function FraisItem({ frais, isEditing, onEdit, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nom: frais.nom,
    description: frais.description,
    montant_usd: frais.montant_usd
  });

  const handleSave = () => {
    onSave(formData);
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
            className="input-field"
            placeholder="Nom du frais"
          />
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="input-field"
            placeholder="Description"
          />
          <input
            type="number"
            value={formData.montant_usd}
            onChange={(e) => setFormData({...formData, montant_usd: parseFloat(e.target.value)})}
            className="input-field"
            placeholder="Montant USD"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="btn-primary text-sm">
            <Save size={14} /> Sauvegarder
          </button>
          <button onClick={onCancel} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
      <div>
        <h4 className="font-medium text-gray-900">{frais.nom}</h4>
        <p className="text-sm text-gray-600">{frais.description}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-bold text-green-600">${frais.montant_usd}</span>
        <button onClick={onEdit} className="text-blue-600 hover:text-blue-800">
          <Edit3 size={16} />
        </button>
      </div>
    </div>
  );
}

// Formulaire d'ajout de frais
function AddFraisForm({ facultes, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    faculte: '',
    nom: '',
    description: '',
    montant_usd: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      montant_usd: parseFloat(formData.montant_usd)
    });
    setFormData({ faculte: '', nom: '', description: '', montant_usd: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={formData.faculte}
          onChange={(e) => setFormData({...formData, faculte: e.target.value})}
          className="input-field"
          required
        >
          <option value="">Sélectionner une faculté</option>
          {facultes.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <input
          type="text"
          value={formData.nom}
          onChange={(e) => setFormData({...formData, nom: e.target.value})}
          className="input-field"
          placeholder="Nom du frais"
          required
        />
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="input-field"
          placeholder="Description"
          required
        />
        <input
          type="number"
          value={formData.montant_usd}
          onChange={(e) => setFormData({...formData, montant_usd: e.target.value})}
          className="input-field"
          placeholder="Montant en USD"
          required
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          <Plus size={16} /> Ajouter
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
          Annuler
        </button>
      </div>
    </form>
  );
}
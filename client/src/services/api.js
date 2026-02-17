import axios from 'axios';

// Détection automatique de l'IP/hostname de l'app (utile pour accès mobile sur LAN)
const detectedHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_URL = import.meta.env.VITE_API_URL || `http://${detectedHost}:5000/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  login: async (matricule) => {
    const response = await api.post('/auth/login', { matricule });
    return response.data;
  },
  
  getFrais: async (matricule) => {
    const response = await api.get(`/frais/${matricule}`);
    return response.data;
  }
};

export default api;

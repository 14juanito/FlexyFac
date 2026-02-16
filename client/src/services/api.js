import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  
  checkMatricule: async (matricule) => {
    const response = await api.get(`/auth/check-matricule/${matricule}`);
    return response.data;
  }
};

export default api;

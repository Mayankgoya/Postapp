import axios from 'react'; // Actually, let's use the default export logic
import baseAxios from 'axios';

const api = baseAxios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

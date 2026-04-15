import baseAxios from 'axios';

const api = baseAxios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Extract precise error message for UI
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    error.friendlyMessage = message;
    
    return Promise.reject(error);
  }
);

export default api;


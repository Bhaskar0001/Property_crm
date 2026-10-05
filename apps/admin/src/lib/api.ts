import axios from 'axios';

const rawBase = (import.meta as any).env?.VITE_API_URL;
const baseURL = rawBase 
  ? `${rawBase.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

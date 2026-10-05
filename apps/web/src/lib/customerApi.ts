import axios from 'axios';

const rawBase = (import.meta as any).env?.VITE_API_URL;
const baseURL = rawBase 
  ? `${rawBase.replace(/\/+$/, '')}/api/v1/customer`
  : '/api/v1/customer';

export const customerApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

customerApi.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('customerToken');
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

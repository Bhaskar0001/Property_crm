import axios from 'axios';

export const customerApi = axios.create({
  baseURL: '/api/v1/customer',
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

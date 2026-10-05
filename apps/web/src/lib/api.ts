import axios from 'axios';

const rawBase = (import.meta as any).env?.VITE_API_URL;
const baseURL = rawBase 
  ? `${rawBase.replace(/\/+$/, '')}/api/v1/public`
  : '/api/v1/public';

export const publicApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

import axios from 'axios';

export const publicApi = axios.create({
  baseURL: '/api/v1/public',
  headers: {
    'Content-Type': 'application/json',
  },
});

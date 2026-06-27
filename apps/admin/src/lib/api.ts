import axios from 'axios';
import { useAuthStore } from './auth';

const BASE = (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8083') + '/api/v1';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

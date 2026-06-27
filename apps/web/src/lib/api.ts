import axios, { type AxiosResponse } from 'axios';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor - attach auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken });
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

// API helper functions

export const businessApi = {
  list: () => api.get('/businesses'),
  get: (id: string) => api.get(`/businesses/${id}`),
  create: (data: Record<string, unknown>) => api.post('/businesses', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/businesses/${id}`, data),
  delete: (id: string) => api.delete(`/businesses/${id}`),
  stats: (id: string) => api.get(`/businesses/${id}/stats`),
};

export const reviewApi = {
  list: (businessId: string, params?: Record<string, unknown>) =>
    api.get(`/businesses/${businessId}/reviews`, { params }),
  analytics: (businessId: string) =>
    api.get(`/businesses/${businessId}/reviews/analytics`),
  reply: (businessId: string, reviewId: string, reply: string) =>
    api.put(`/businesses/${businessId}/reviews/${reviewId}/reply`, { reply }),
  generateAIReply: (businessId: string, reviewId: string, tone?: string) =>
    api.post(`/businesses/${businessId}/reviews/${reviewId}/ai-reply`, { tone }),
  analyzeSentiment: (businessId: string, reviewId: string) =>
    api.post(`/businesses/${businessId}/reviews/${reviewId}/analyze-sentiment`),
};

export const whatsAppApi = {
  sendText: (businessId: string, to: string, text: string) =>
    api.post('/whatsapp/send/text', { businessId, to, text }),
  conversations: (businessId: string, params?: Record<string, unknown>) =>
    api.get('/whatsapp/conversations', { params: { businessId, ...params } }),
  messages: (conversationId: string) =>
    api.get(`/whatsapp/conversations/${conversationId}/messages`),
  launchCampaign: (businessId: string, campaignId: string) =>
    api.post(`/whatsapp/campaigns/${campaignId}/launch`, { businessId }),
};

export const customerApi = {
  list: (businessId: string, params?: Record<string, unknown>) =>
    api.get(`/businesses/${businessId}/customers`, { params }),
  get: (businessId: string, id: string) =>
    api.get(`/businesses/${businessId}/customers/${id}`),
  create: (businessId: string, data: Record<string, unknown>) =>
    api.post(`/businesses/${businessId}/customers`, data),
};

export const analyticsApi = {
  dashboard: (businessId: string) =>
    api.get(`/businesses/${businessId}/analytics/dashboard`),
  metrics: (businessId: string, params: Record<string, unknown>) =>
    api.get(`/businesses/${businessId}/analytics/metrics`, { params }),
};

export const offerApi = {
  list: (businessId: string) => api.get(`/businesses/${businessId}/offers`),
  create: (businessId: string, data: Record<string, unknown>) =>
    api.post(`/businesses/${businessId}/offers`, data),
};

export const aiApi = {
  complete: (messages: Array<{ role: string; content: string }>, useCase?: string) =>
    api.post('/ai/complete', { messages, useCase }),
  usage: (days?: number) => api.get('/ai/usage', { params: { days } }),
};

export type { AxiosResponse };

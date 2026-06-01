import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const assessmentsApi = {
  list: (params: any) => api.get('/assessments/', { params }),
  get: (id: string) => api.get(`/assessments/${id}`),
  start: (id: string) => api.post(`/assessments/${id}/start`),
  submit: (id: string, responses: any) => api.post(`/assessments/attempts/${id}/submit`, responses),
  getAttempt: (id: string) => api.get(`/assessments/attempts/${id}`),
  getLeaderboard: (id: string) => api.get(`/assessments/${id}/leaderboard`),
};

export const interviewsApi = {
  start: (category: string) => api.post(`/interviews/start?category=${category}`),
  submit: (id: number, data: any) => api.post(`/interviews/sessions/${id}/submit`, data),
  getSessions: () => api.get('/interviews/sessions/me'),
  getSession: (id: string) => api.get(`/interviews/sessions/${id}`),
};

export const questionsApi = {
  getCategories: () => api.get('/questions/categories'),
};

export default api;

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

export const authApi = {
  login: (data: FormData) => api.post('/auth/token', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/users/me'),
};

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

export const placementsApi = {
  listJobs: () => api.get('/placements/jobs'),
  getJob: (id: string) => api.get(`/placements/jobs/${id}`),
  createJob: (data: any) => api.post('/placements/jobs', data),
  apply: (jobId: number, resumeUrl?: string) => api.post('/placements/apply', { job_id: jobId, resume_url: resumeUrl }),
  getMyApplications: () => api.get('/placements/applications/me'),
  getJobApplicants: (jobId: string) => api.get(`/placements/jobs/${jobId}/applicants`),
  updateApplication: (id: number, data: any) => api.patch(`/placements/applications/${id}`, data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const questionsApi = {
  getCategories: () => api.get('/questions/categories'),
};

export default api;

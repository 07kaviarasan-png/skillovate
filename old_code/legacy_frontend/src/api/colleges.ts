import apiClient from './apiClient';

export const collegesApi = {
  list: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/colleges/', { params });
    return response.data;
  },
  search: async (query: string, params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/colleges/search', { params: { query, ...params } });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/colleges/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/colleges/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/colleges/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/colleges/${id}`);
    return response.data;
  },
};

export const batchesApi = {
  list: async (params?: { skip?: number; limit?: number; college_id?: number }) => {
    const response = await apiClient.get('/batches/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/batches/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/batches/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/batches/${id}`, data);
    return response.data;
  },
  addStudent: async (batchId: number, studentId: number) => {
    const response = await apiClient.post(`/batches/${batchId}/students/${studentId}`);
    return response.data;
  },
  removeStudent: async (batchId: number, studentId: number) => {
    const response = await apiClient.delete(`/batches/${batchId}/students/${studentId}`);
    return response.data;
  },
};

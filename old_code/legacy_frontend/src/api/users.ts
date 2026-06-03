import apiClient from './apiClient';

export const usersApi = {
  list: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/users/', { params });
    return response.data;
  },
  search: async (query: string, params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/users/search', { params: { query, ...params } });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/users/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

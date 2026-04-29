import { api } from './api';
import type { Citizen, CitizenStatus } from '../types';

export const citizenService = {
  async getCitizens({ 
    page = 1, 
    pageSize = 20, 
    status = 'all', 
    province = 'all', 
    search = '' 
  }) {
    const { data } = await api.get('/citizens', {
      params: { page, limit: pageSize, status, province, search }
    });
    
    if (!data.success) throw new Error(data.message);

    return { 
      data: data.data as Citizen[], 
      count: data.meta.total, 
      error: null 
    };
  },

  async getCitizenById(id: string) {
    const { data } = await api.get(`/citizens/${id}`);
    if (!data.success) throw new Error(data.message);
    return { data: data.data as Citizen, error: null };
  },

  async updateCitizenStatus(id: string, status: CitizenStatus) {
    const { data } = await api.patch(`/citizens/${id}/status`, { status });
    if (!data.success) throw new Error(data.message);
    return { data: data.data, error: null };
  }
};

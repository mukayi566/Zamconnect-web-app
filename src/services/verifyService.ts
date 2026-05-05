import { api } from './api';
import type { VerificationLog } from '../types';

export const verifyService = {
  async getLogs({ page = 1, pageSize = 25, result = 'all', search = '' }) {
    const { data } = await api.get('/verify/logs', {
      params: { page, limit: pageSize, result, search }
    });

    if (!data.success) throw new Error(data.message);

    return { 
      data: data.data as VerificationLog[], 
      count: data.meta.total, 
      error: null 
    };
  },

  async verifyByNRC(nrc_number: string, organization?: string) {
    const { data } = await api.post('/verify/nrc', { nrc_number, organization });
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async verifyByQR(qr_token: string, organization?: string) {
    const { data } = await api.post('/verify/qr', { qr_token, organization });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

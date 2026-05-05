import { api } from './api';

export interface Partner {
  id: string;
  organisation_name: string;
  organisation_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  purpose: string;
  website?: string;
  zicta_license?: string;
  requested_fields: string[];
  status: 'pending' | 'approved' | 'rejected';
  sandbox_api_key: string;
  production_api_key?: string;
  created_at: string;
}

export const partnerService = {
  getPartners: async () => {
    const { data } = await api.get('/partner/');
    return data.data as Partner[];
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected') => {
    const { data } = await api.post(`/partner/${id}/status`, { status });
    return data.data as Partner;
  },

  regenerateKey: async (id: string, keyType: 'sandbox' | 'production') => {
    const { data } = await api.post(`/partner/${id}/regenerate-key?key_type=${keyType}`);
    return data.data;
  },
};

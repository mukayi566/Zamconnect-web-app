import { api } from './api';
import type { AuditLog } from '../types';

export const auditService = {
  async logAction(logData: Partial<AuditLog>) {
    // In our backend, audit logs are handled by the server for sensitive actions.
    // However, if the frontend needs to log something specific:
    const { data } = await api.post('/audit/logs', logData);
    return { data, error: null };
  },

  async getAuditLogs({ page = 1, pageSize = 30, search = '', action = 'all' }) {
    const { data } = await api.get('/audit/logs', {
      params: { page, limit: pageSize, search, action }
    });

    if (!data.success) throw new Error(data.message);

    return { 
      data: data.data as AuditLog[], 
      count: data.meta.total, 
      error: null 
    };
  }
};

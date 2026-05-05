import { api } from './api';

export interface DashboardStats {
  total_citizens: number;
  active_count: number;
  pending_count: number;
  suspended_count: number;
  rejected_count: number;
  verifications_today: number;
  recent_activity: any[];
}

export const adminService = {
  async getDashboardStats() {
    const { data } = await api.get('/admin/dashboard/stats');
    if (!data.success) throw new Error(data.message);
    return data.data as DashboardStats;
  }
};

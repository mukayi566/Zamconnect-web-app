import { supabase } from './supabase';
import type { AuditLog } from '../types';

export const auditService = {
  async logAction({ 
    actor_id, 
    actor_email, 
    action, 
    target_id, 
    target_type, 
    metadata = {} 
  }: Partial<AuditLog>) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        actor_id,
        actor_email,
        action,
        target_id,
        target_type,
        metadata,
        created_at: new Date().toISOString()
      });

    return { data, error };
  },

  async getAuditLogs({ page = 0, pageSize = 30, search = '', action = 'all' }) {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (action !== 'all') {
      query = query.eq('action', action);
    }

    if (search) {
      query = query.ilike('actor_email', `%${search}%`);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    return { data: data as AuditLog[], count, error };
  }
};

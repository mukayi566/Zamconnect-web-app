import { supabase } from './supabase';
import type { VerificationLog } from '../types';

export const verifyService = {
  async getLogs({ page = 0, pageSize = 25, result = 'all', search = '' }) {
    let query = supabase
      .from('verification_logs')
      .select('*, citizen:citizens(*)', { count: 'exact' });

    if (result !== 'all') {
      query = query.eq('result', result);
    }

    if (search) {
      // Search by NRC of the citizen joined
      // Note: Supabase sometimes struggles with filtering by joined table in a single ilike if not configured with PostgREST 
      // For simplicity, we assume we can search by organization or record id
      query = query.or(`organization.ilike.%${search}%,ip_address.ilike.%${search}%`);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    return { data: data as VerificationLog[], count, error };
  }
};

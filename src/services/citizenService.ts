import { supabase } from './supabase';
import type { Citizen, CitizenStatus } from '../types';

export const citizenService = {
  async getCitizens({ 
    page = 0, 
    pageSize = 20, 
    status = 'all', 
    province = 'all', 
    search = '' 
  }) {
    let query = supabase
      .from('citizens')
      .select('*', { count: 'exact' });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (province !== 'all') {
      query = query.eq('province', province);
    }

    if (search) {
      query = query.or(`nrc_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    return { data: data as Citizen[], count, error };
  },

  async getCitizenById(id: string) {
    const { data, error } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as Citizen, error };
  },

  async updateCitizenStatus(id: string, status: CitizenStatus) {
    const { data, error } = await supabase
      .from('citizens')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

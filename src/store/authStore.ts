import { create } from 'zustand';
import type { AuthState } from '../types';
import { supabase } from '../services/supabase';

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ session: null, user: null });
  },
}));

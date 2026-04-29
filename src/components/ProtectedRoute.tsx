import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabase';
import { api } from '../services/api';

export const ProtectedRoute: React.FC = () => {
  const { session, setSession, user, setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Check Supabase session first (legacy/hybrid)
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession) {
          setSession(sbSession);
        }

        // 2. Check if we have a user in store or token in localStorage
        const token = localStorage.getItem('accessToken');
        if (token && !user) {
          try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
              setUser(response.data.data);
            }
          } catch (err) {
            console.error("Failed to fetch user profile:", err);
            // If token is invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, setUser, setSession, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!session && !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

import React, { useState } from 'react';
import { 
  Shield, 
  LogOut, 
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Settings as SettingsIcon,
  Bell,
  Cpu,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabase';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const passwordSchema = Yup.object().shape({
  newPassword: Yup.string().min(8, 'Minimum 8 characters required').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const Settings: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePassword = async (values: any, { resetForm, setSubmitting }: any) => {
    setSuccess(null);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });
      if (error) throw error;
      setSuccess('Administrative password updated successfully.');
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ── Page Header ── */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <SettingsIcon size={20} className="text-primary" />
          </div>
          <span className="text-[11px] font-black text-primary/60 uppercase tracking-[0.2em]">Administrative Console</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-slate-500 font-medium text-sm">Manage your security credentials and portal preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Profile Column ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] flex items-center justify-center text-primary font-black text-4xl shadow-inner ring-4 ring-slate-50">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={16} />
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{user?.full_name}</h3>
              <p className="text-slate-400 text-sm font-bold truncate mb-6">{user?.email}</p>
              
              <div className="flex justify-center mb-8">
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border border-primary/20 shadow-sm">
                  {user?.role || 'SYSTEM ADMIN'}
                </span>
              </div>
              
              <div className="pt-6 border-t border-slate-50">
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 group/logout shadow-sm"
                >
                  <LogOut size={16} className="group-hover/logout:-translate-x-1 transition-transform" />
                  <span>Terminate Session</span>
                </button>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Security Telemetry</h4>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Cpu size={18} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Access Node IP</p>
                  <p className="text-sm font-mono font-black text-slate-700">102.65.12.98</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Last Auth Event</p>
                  <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                    {user?.last_login ? new Date(user.last_login).toLocaleTimeString() : 'Current Session'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Forms Column ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* Password Form */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="p-8 sm:p-10 border-b border-slate-50 relative z-10 flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Authentication Update</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rotate Administrative Password</p>
              </div>
            </div>
            
            <div className="p-8 sm:p-10 relative z-10">
              {success && (
                <div className="mb-8 p-5 bg-green-50 border border-green-100 rounded-2xl flex items-center space-x-4 text-green-700 font-black text-xs uppercase tracking-widest animate-in zoom-in-95">
                  <CheckCircle size={20} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-4 text-red-700 font-black text-xs uppercase tracking-widest">
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <Formik
                initialValues={{ newPassword: '', confirmPassword: '' }}
                validationSchema={passwordSchema}
                onSubmit={handleUpdatePassword}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                        <Field 
                          name="newPassword" 
                          type="password" 
                          className={cn(
                            "w-full h-14 px-6 bg-slate-50 border rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all",
                            errors.newPassword && touched.newPassword ? "border-red-200" : "border-slate-100"
                          )} 
                          placeholder="••••••••••••" 
                        />
                        <ErrorMessage name="newPassword" component="p" className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-1" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Update</label>
                        <Field 
                          name="confirmPassword" 
                          type="password" 
                          className={cn(
                            "w-full h-14 px-6 bg-slate-50 border rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all",
                            errors.confirmPassword && touched.confirmPassword ? "border-red-200" : "border-slate-100"
                          )} 
                          placeholder="••••••••••••" 
                        />
                        <ErrorMessage name="confirmPassword" component="p" className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-1" />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                       <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Authorize Password Update</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden">
            <div className="flex items-center space-x-4 mb-10 border-b border-slate-50 pb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Bell size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Preferences</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Portal Communication Logic</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="font-black text-slate-900 tracking-tight">Multi-Factor Authentication (MFA)</p>
                  <p className="text-xs text-slate-400 font-medium">Add an extra layer of biometric or token validation to your session.</p>
                </div>
                <div className="w-14 h-8 bg-slate-100 rounded-full relative cursor-not-allowed border border-slate-200">
                   <div className="absolute left-1.5 top-1.5 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="font-black text-slate-900 tracking-tight">Critical Event Notifications</p>
                  <p className="text-xs text-slate-400 font-medium">Receive real-time alerts for identity state changes and audit failures.</p>
                </div>
                 <div className="w-14 h-8 bg-primary rounded-full relative border border-primary/20 shadow-lg shadow-primary/10 cursor-pointer">
                   <div className="absolute right-1.5 top-1.5 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

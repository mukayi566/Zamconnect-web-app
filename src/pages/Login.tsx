import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Lock, Info, Eye, EyeOff, AlertCircle, ShieldCheck, ChevronRight, User } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setSession, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleLogin = async (values: any, { setSubmitting }: any) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        const role = values.email.includes('admin') ? 'admin' : (values.email.includes('registrar') ? 'registrar' : 'verifier');
        setUser({
          id: data.user.id,
          email: data.user.email!,
          full_name: values.email.split('@')[0].toUpperCase(),
          role: role as any,
          province: 'Lusaka',
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f8fafc] overflow-hidden">
      {/* Left Panel: Brand & Visual Identity */}
      <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 relative overflow-hidden flex-col justify-between p-8 md:p-10 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/login-bg.png" 
            alt="Digital Connectivity" 
            className="w-full h-full object-cover scale-105 animate-pulse-slow blur-md" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-zambia-black/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
        </div>

        {/* Brand Content */}
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8 group cursor-pointer">
            <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <img src="/login-logo.jpeg" alt="ZamID Logo" className="w-full h-full object-contain" />
            </div>
            <div>
            </div>
          </div>

          <div className="max-w-xl space-y-8">
            <h1 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">
              Securing the <br />
              <span className="text-secondary drop-shadow-lg">Zambian Identity</span> <br />
              for a Digital Era.
            </h1>
            <p className="text-base text-white/80 leading-relaxed font-light">
              Zambia's next-generation national digital identity platform. 
              Connecting citizens to essential services with speed, security, and integrity.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <ShieldCheck size={18} className="text-secondary" />
                <span className="text-sm font-medium">Bank-grade Security</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <User size={18} className="text-secondary" />
                <span className="text-sm font-medium">18M+ Citizens</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 md:pt-0">
          <div className="h-[1px] w-24 bg-secondary mb-6"></div>
          <p className="text-sm text-white/50 font-medium">
            © {new Date().getFullYear()} Government of the Republic of Zambia. <br className="hidden sm:block" />
            Empowering the nation through digital transformation.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full md:w-7/12 lg:w-1/2 bg-white h-full overflow-y-auto flex flex-col items-center py-8 px-6 md:px-10 lg:px-16">
        <div className="w-full max-w-md my-auto">
          <div className="mb-8">
            {/* Mobile Logo - Visible only on small screens */}
            <div className="md:hidden flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="w-44 h-44 flex items-center justify-center overflow-hidden mb-1">
                <img src="/login-logo-mobile.png" alt="ZamID Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="hidden md:inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
              <Lock size={20} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight md:text-left text-center">Portal Login</h2>
            <p className="text-slate-500 text-base md:text-left text-center">Identity Management System Administration</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start space-x-3 text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">Authentication Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex justify-between items-center" htmlFor="email">
                    Email
                    {touched.email && errors.email && <span className="text-[10px] text-red-500 lowercase normal-case flex items-center gap-1 font-semibold"><AlertCircle size={10} /> {errors.email as string}</span>}
                  </label>
                  <div className="relative group">
                    <Field
                      name="email"
                      type="email"
                      className={`w-full px-5 py-3 rounded-2xl border-2 transition-all outline-none text-slate-900 bg-slate-50 font-medium ${touched.email && errors.email ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-primary focus:bg-white group-hover:border-slate-200'}`}
                      placeholder="e.g. j.banda@zamid.gov.zm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex justify-between items-center" htmlFor="password">
                    Secure Password
                    {touched.password && errors.password && <span className="text-[10px] text-red-500 lowercase normal-case flex items-center gap-1 font-semibold"><AlertCircle size={10} /> {errors.password as string}</span>}
                  </label>
                  <div className="relative group">
                    <Field
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full px-5 py-3 rounded-2xl border-2 transition-all outline-none text-slate-900 bg-slate-50 font-medium ${touched.password && errors.password ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-primary focus:bg-white group-hover:border-slate-200'}`}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors hover:bg-white rounded-xl"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider">Forgot password?</button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden group py-3 bg-primary text-white rounded-2xl font-bold text-base shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
                >
                  <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Sign In to Portal</span>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </Form>
            )}
          </Formik>

          {/* Enhanced Demo Credentials */}
          <div className="mt-6">
            <button 
              onClick={() => setIsDemoOpen(!isDemoOpen)}
              className="w-full group rounded-2xl p-4 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                  <Info size={18} />
                </div>
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Demo Environment Credentials</span>
              </div>
              <div className={`transform transition-transform duration-300 ${isDemoOpen ? 'rotate-180' : ''}`}>
                <ChevronRight size={18} className="text-slate-400 rotate-90" />
              </div>
            </button>
            
            {isDemoOpen && (
              <div className="mt-4 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 group hover:border-primary/20 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Super Admin</p>
                    <p className="text-sm font-mono text-slate-700 font-bold select-all">admin@zamid.gov.zm</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 group hover:border-primary/20 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Registrar</p>
                    <p className="text-sm font-mono text-slate-700 font-bold select-all">registrar@zamid.gov.zm</p>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border-l-4 border-primary flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Common Access Key</p>
                    <p className="text-sm font-mono text-primary font-black select-all">ZamID@2026!</p>
                  </div>
                  <div className="hidden sm:block p-1.5 px-3 bg-white font-bold text-[10px] text-primary rounded-lg shadow-sm">DEMO ONLY</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

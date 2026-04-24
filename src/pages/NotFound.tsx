import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Illustration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-xl ring-1 ring-slate-100 mb-2">
            <AlertCircle size={48} className="text-red-500 animate-pulse" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          ZamConnect <span className="text-primary">Unavailable</span>
        </h1>
        
        <p className="text-slate-600 text-lg mb-10 leading-relaxed">
          The page you are looking for is either under maintenance or does not exist. 
          Please check the URL or try again later.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1"
          >
            <Home size={18} />
            Back to Home
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold transition-all hover:border-primary/20 hover:text-primary"
          >
            <RefreshCcw size={18} />
            Try Refreshing
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-400 font-medium">
            Error Code: 404 - RESOURCE_NOT_FOUND
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, User, Menu, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const currentTime = new Date();

  // Map path to title
  const getPageTitle = (pathname: string) => {
    const path = pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 transition-all duration-300">
      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-xl lg:hidden transition-colors"
        >
          <Menu size={22} />
        </button>
        
        <div className="hidden md:block">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
            {getPageTitle(location.pathname)}
          </h1>
          <div className="flex items-center text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em]">
            <Calendar size={12} className="mr-1.5 text-primary/60" />
            <span>{format(currentTime, 'EEEE, dd MMMM yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        {/* Search Bar */}
        <div className="relative hidden xl:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search records, IDs..." 
            className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 focus:bg-white w-72 transition-all group-hover:bg-slate-100/50"
          />
        </div>

        {/* Notifications */}
        <button className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-xl relative transition-all active:scale-95 group">
          <Bell size={20} className="group-hover:text-primary transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block"></div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 truncate max-w-[120px] group-hover:text-primary transition-colors leading-tight">
              {user?.full_name || 'Administrator'}
            </p>
            <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mt-0.5">
              {user?.role || 'SYSTEM'}
            </p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-0.5 shrink-0 group-hover:border-primary/30 transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black text-sm">
                {user?.full_name?.charAt(0) || <User size={18} />}
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

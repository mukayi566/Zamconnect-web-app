import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  ScrollText, 
  ScanLine, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Citizens', path: '/citizens' },
  { icon: ShieldCheck, label: 'Verification Logs', path: '/verification-logs' },
  { icon: ScrollText, label: 'Audit Log', path: '/audit-logs' },
  { icon: ScanLine, label: 'Verify Tool', path: '/verify' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 lg:hidden transition-all duration-500" 
          onClick={toggle}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-900 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform flex flex-col shadow-xl border-r border-slate-100",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Logo Section */}
        <div className="h-20 flex items-center px-7 relative">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-black/5 group-hover:scale-105 transition-transform duration-300 ring-1 ring-slate-100">
              <img src="/zambia-coat-of-arms.svg" alt="Coat of Arms" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="block font-black text-lg tracking-tight leading-none text-slate-900">ZamID</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] opacity-80">Connect Portal</span>
            </div>
          </div>
          <button 
            onClick={toggle}
            className="lg:hidden absolute right-6 p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Zambia Flag Accent */}
        <div className="px-7 mb-6">
          <div className="h-1 w-full flex rounded-full overflow-hidden opacity-60">
            <div className="flex-1 bg-zambia-green"></div>
            <div className="flex-1 bg-yellow-400"></div>
            <div className="flex-1 bg-zambia-black"></div>
            <div className="flex-1 bg-zambia-orange"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center justify-between group px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/25" 
                  : "text-slate-500 hover:text-primary hover:bg-primary/5"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3.5 relative z-10">
                    <item.icon size={20} className={cn(
                      "transition-all duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className={cn(
                      "font-bold text-sm tracking-wide transition-colors",
                      isActive ? "text-white" : "group-hover:text-primary"
                    )}>{item.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight size={14} className="relative z-10 text-white/70" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section - Simplified Logout */}
        <div className="p-6 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all relative z-10 group/logout active:scale-95 shadow-sm"
          >
            <LogOut size={16} className="group-hover/logout:-translate-x-1 transition-transform" />
            <span>Logout Portal</span>
          </button>
        </div>

        {/* System Version */}
        <div className="px-8 pb-6 pt-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
            ZamID Connect v2.4.0
          </p>
        </div>
      </aside>
    </>
  );
};

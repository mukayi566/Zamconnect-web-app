import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Activity, 
  ArrowRight,
  ClipboardList,
  UserCheck,
  Clock
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: any;
  accentColor: 'primary' | 'amber' | 'green' | 'blue';
}> = ({ label, value, icon: Icon, accentColor }) => {
  const colors = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl border transition-transform duration-500 group-hover:scale-110 ${colors[accentColor]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
      </div>
    </div>
  );
};

export const RegistrarDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminService.getDashboardStats,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ClipboardList size={20} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary/60 uppercase tracking-[0.2em]">Registrar Control Panel</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Identity Workspace</h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Manage citizen enrolments and verify identity credentials.
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Registered"
          value={isLoading ? '...' : (stats?.total_citizens || 0).toLocaleString()}
          icon={Users}
          accentColor="primary"
        />
        <StatCard
          label="Pending Approval"
          value={isLoading ? '...' : (stats?.pending_count || 0).toLocaleString()}
          icon={UserPlus}
          accentColor="amber"
        />
        <StatCard
          label="Active Identities"
          value={isLoading ? '...' : (stats?.active_count || 0).toLocaleString()}
          icon={UserCheck}
          accentColor="green"
        />
        <StatCard
          label="Verifications Today"
          value={isLoading ? '...' : (stats?.verifications_today || 0).toLocaleString()}
          icon={ShieldCheck}
          accentColor="blue"
        />
      </div>

      {/* ── Quick Actions & Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Registry Operations
          </h3>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/verify')}
              className="w-full group bg-gradient-to-br from-white to-slate-50 border border-slate-100 p-6 rounded-[2.5rem] flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="flex items-center space-x-4 text-left">
                <div className="p-4 bg-primary/10 rounded-3xl text-primary group-hover:scale-110 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-widest mb-1">Verify Tool</h4>
                  <p className="text-sm text-slate-500 font-medium">Verify NRC/QR tokens</p>
                </div>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => navigate('/citizens')}
              className="w-full group bg-gradient-to-br from-white to-slate-50 border border-slate-100 p-6 rounded-[2.5rem] flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="flex items-center space-x-4 text-left">
                <div className="p-4 bg-blue-100 rounded-3xl text-blue-600 group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-widest mb-1">Citizen Registry</h4>
                  <p className="text-sm text-slate-500 font-medium">View all records</p>
                </div>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-50 rounded-xl">
                <Clock size={18} className="text-slate-400" />
              </div>
              <h3 className="font-black text-slate-900 tracking-tight">Recent Registry Activity</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : stats?.recent_activity?.length ? (
              <div className="divide-y divide-slate-50">
                {stats.recent_activity.map((log: any) => (
                  <div key={log.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                        log.result === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {log.action.replace('_', ' ')}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{log.actor_email}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                         log.result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {log.result}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                  <Activity size={24} className="text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No recent registry activity detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

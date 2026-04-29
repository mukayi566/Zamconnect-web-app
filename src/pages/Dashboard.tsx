import React from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight,
  Plus,
  Activity,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { RegistrationLineChart } from '../components/charts/RegistrationLineChart';
import { StatusPieChart } from '../components/charts/StatusPieChart';
import { ProvinceBarChart } from '../components/charts/ProvinceBarChart';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/formatters';
import { adminService } from '../services/adminService';
import { useQuery } from '@tanstack/react-query';


const actorInitials = (email: string) => email.split('@')[0].slice(0, 2).toUpperCase();
const actorColor = (email: string) => {
  const map: Record<string, string> = {
    admin: 'bg-primary/15 text-primary border-primary/20',
    registrar: 'bg-green-100 text-green-700 border-green-200',
    verifier: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  for (const [key, cls] of Object.entries(map)) {
    if (email.includes(key)) return cls;
  }
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminService.getDashboardStats,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Hero Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-white shadow-2xl shadow-primary/20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-black/10 blur-3xl" />
        {/* Zambia flag stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-zambia-green" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-zambia-black" />
          <div className="flex-1 bg-zambia-orange" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-1">
              <span className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                <Sparkles size={12} className="text-yellow-300" />
                <span>Live System</span>
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              National ID Overview
            </h2>
            <p className="text-white/70 font-medium text-sm max-w-md">
              Real-time statistics for Zambia's national digital identity management system.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center space-x-2 bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 transition-all px-5 py-2.5 rounded-2xl text-sm font-bold">
              <TrendingUp size={16} />
              <span>Export Report</span>
            </button>
            <Link
              to="/citizens"
              className="flex items-center space-x-2 bg-white text-primary hover:bg-white/90 transition-all px-5 py-2.5 rounded-2xl text-sm font-black shadow-xl shadow-black/10 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <Plus size={16} />
              <span>New Registration</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Citizens"
          value={isLoading ? '...' : (stats?.total_citizens || 0).toLocaleString()}
          icon={Users}
          trend={{ value: 12.5, isUp: true }}
          accentColor="primary"
        />
        <StatCard
          label="Pending Verification"
          value={isLoading ? '...' : (stats?.pending_count || 0).toLocaleString()}
          icon={UserPlus}
          trend={{ value: 2.1, isUp: false }}
          accentColor="amber"
        />
        <StatCard
          label="Active Identities"
          value={isLoading ? '...' : (stats?.active_count || 0).toLocaleString()}
          icon={CheckCircle}
          trend={{ value: 5.4, isUp: true }}
          accentColor="green"
        />
        <StatCard
          label="Verifications Today"
          value="3,412"
          icon={ShieldCheck}
          trend={{ value: 8.2, isUp: true }}
          accentColor="primary"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Activity size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">Registration Trend</h3>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Last 30 Days</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-primary/5 border border-primary/15 rounded-full px-3 py-1.5">
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">New Enrolments</span>
            </div>
          </div>
          <div className="p-6">
            <RegistrationLineChart />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <ShieldCheck size={18} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight">Identity Status</h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Distribution</p>
            </div>
          </div>
          <div className="p-6">
            <StatusPieChart data={[
              { name: 'Active', value: stats?.active_count || 0, color: '#15803D' },
              { name: 'Pending', value: stats?.pending_count || 0, color: '#A16207' },
              { name: 'Suspended', value: stats?.suspended_count || 0, color: '#DC2626' },
              { name: 'Rejected', value: stats?.rejected_count || 0, color: '#B91C1C' },
            ]} />
          </div>
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Province Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Users size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">Registrations by Province</h3>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">All Provinces</p>
              </div>
            </div>
            <Link
              to="/citizens"
              className="flex items-center space-x-1 text-primary text-xs font-black uppercase tracking-wider hover:underline group"
            >
              <span>View All</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-6">
            <ProvinceBarChart />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Clock size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">Recent System Activity</h3>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Live Feed</p>
              </div>
            </div>
            <Link
              to="/audit-logs"
              className="flex items-center space-x-1 text-primary text-xs font-black uppercase tracking-wider hover:underline group"
            >
              <span>Audit Log</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 font-medium">Loading activity...</div>
            ) : stats?.recent_activity && stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center text-xs font-black shrink-0 ${actorColor(activity.actor_email || 'system')}`}>
                    {actorInitials(activity.actor_email || 'SYS')}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                      {(activity.actor_email || 'system').split('@')[0]}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {activity.target_type ? `${activity.target_type}: ` : ''}
                      {activity.target_id ? activity.target_id.substring(0, 8) : 'System'}
                    </p>
                  </div>
                  {/* Badge + Time */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge status={activity.action.split('_')[0].toLowerCase()}>
                      {activity.action}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 font-medium text-sm">No recent activity recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

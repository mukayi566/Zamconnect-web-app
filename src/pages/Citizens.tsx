import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Eye, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Download,
  Search,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { citizenService } from '../services/citizenService';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/formatters';

const provinces = [
  'Lusaka', 'Copperbelt', 'Central', 'Southern', 'Eastern', 
  'Western', 'Northern', 'Luapula', 'North-Western', 'Muchinga'
];

export const Citizens: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [province, setProvince] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['citizens', page, search, status, province],
    queryFn: () => citizenService.getCitizens({ 
      page: page + 1, 
      search, 
      status: status as any, 
      province 
    }),
  });

  const totalPages = data?.count ? Math.ceil(data.count / 20) : 0;

  // Helper to ensure we have a valid absolute URL for assets
  const getAssetUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (baseUrl) {
      return `${baseUrl}/storage/v1/object/public/citizens/${url}`;
    }
    return url;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users size={20} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary/60 uppercase tracking-[0.2em]">Registry Management</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Citizens Database</h2>
          <p className="text-slate-500 font-medium text-sm">Securely manage and verify national identity records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-100 hover:bg-slate-50 text-slate-700 transition-all px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm active:scale-95">
            <Download size={18} />
            <span>Export Registry</span>
          </button>
        </div>
      </div>

      {/* ── Main Database View ── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden transition-all">
        {/* Advanced Filters Section */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by NRC, name or email..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all shadow-sm"
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 appearance-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown size={14} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <select 
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 appearance-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="all">All Provinces</option>
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown size={14} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 flex justify-center">
              <button 
                onClick={() => { setSearch(''); setStatus('all'); setProvince('all'); }}
                className="w-full h-full flex items-center justify-center p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-2xl transition-all shadow-sm"
                title="Clear Filters"
              >
                <Sparkles size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Citizen Information</th>
                <th className="px-6 py-5 text-center">NRC Number</th>
                <th className="px-6 py-5">Region</th>
                <th className="px-6 py-5">System Status</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Registered</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6" colSpan={7}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-100 rounded w-48" />
                          <div className="h-3 bg-slate-100 rounded w-32" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-primary/[0.02] transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="relative group/avatar">
                          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary font-black overflow-hidden group-hover/avatar:border-primary/30 transition-all">
                            {getAssetUrl(citizen.photo_url) ? (
                              <img src={getAssetUrl(citizen.photo_url)!} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                {citizen.first_name.charAt(0)}{citizen.last_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <div className={`w-2 h-2 rounded-full ${citizen.status === 'active' ? 'bg-green-500' : citizen.status === 'pending' ? 'bg-amber-400' : 'bg-red-500'}`} />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors truncate">
                            {citizen.first_name} {citizen.last_name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium truncate">{citizen.email || 'No identity email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-sm font-mono font-black text-slate-700 tracking-wider">
                        {citizen.nrc_number}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{citizen.province}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Republic of Zambia</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge status={citizen.status} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                        {citizen.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {citizen.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600">{formatDate(citizen.created_at)}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase">Registered</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/citizens/${citizen.id}`)}
                          className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 rounded-xl transition-all"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        <button className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200 rounded-xl transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-dashed border-slate-200">
                        <Users className="text-slate-300 w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">No records discovered</h4>
                      <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm font-medium">Try refining your search parameters or filters to locate specific identity records in the national database.</p>
                      <button 
                        onClick={() => { setSearch(''); setStatus('all'); setProvince('all'); }}
                        className="mt-6 px-6 py-2.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.1em]">
            Displaying <span className="text-primary font-black">{data?.data?.length || 0}</span> of <span className="text-slate-900 font-black">{data?.count || 0}</span> entries
          </p>
          
          <div className="flex items-center space-x-3">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-10 h-10 text-xs font-black rounded-xl transition-all ${
                    page === i 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                      : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

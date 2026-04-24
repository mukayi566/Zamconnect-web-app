import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  User,
  ChevronDown,
  ChevronUp,
  ScrollText,
  Search,
  Activity,
  ArrowUpDown,
  Code
} from 'lucide-react';
import { auditService } from '../services/auditService';
import { formatDateTime } from '../utils/formatters';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, action],
    queryFn: () => auditService.getAuditLogs({ page, search, action }),
  });

  const totalPages = data?.count ? Math.ceil(data.count / 30) : 0;

  const getActionBadgeColor = (action: string) => {
    if (action.includes('ACTIVATE')) return 'bg-green-50 text-green-700 border-green-100';
    if (action.includes('SUSPEND')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (action.includes('REJECT')) return 'bg-red-50 text-red-700 border-red-100';
    if (action.includes('VERIFY')) return 'bg-primary/5 text-primary border-primary/10';
    if (action.includes('LOGIN')) return 'bg-slate-50 text-slate-600 border-slate-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ScrollText size={20} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary/60 uppercase tracking-[0.2em]">Compliance & Governance</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Audit Trail</h2>
          <p className="text-slate-500 font-medium text-sm">Comprehensive record of all administrative and security actions.</p>
        </div>
      </div>

      {/* ── Audit Log View ── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden transition-all">
        {/* Filters */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by authorized actor email..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <select 
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 appearance-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="all">All Administrative Actions</option>
                  <option value="ACTIVATE_CITIZEN">Activate Citizen</option>
                  <option value="SUSPEND_CITIZEN">Suspend Citizen</option>
                  <option value="REJECT_CITIZEN">Reject Citizen</option>
                  <option value="VERIFY_ID">Verify ID</option>
                  <option value="LOGIN">System Login</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="w-14 px-4 py-5 text-center">Detail</th>
                <th className="px-6 py-5">Event Timestamp</th>
                <th className="px-6 py-5">Authorized Actor</th>
                <th className="px-6 py-5">Performed Action</th>
                <th className="px-6 py-5">Subject Type</th>
                <th className="px-8 py-5 text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6" colSpan={6}>
                      <div className="h-6 bg-slate-100 rounded-lg w-full"></div>
                    </td>
                  </tr>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`hover:bg-primary/[0.01] transition-all group cursor-pointer ${expandedId === log.id ? 'bg-primary/[0.02]' : ''}`}
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-5 text-center">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all mx-auto",
                          expandedId === log.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-white"
                        )}>
                          {expandedId === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{formatDateTime(log.created_at)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-primary/20 transition-all">
                            <User size={14} />
                          </div>
                          <span className="text-sm font-black text-slate-700 group-hover:text-primary transition-colors">{log.actor_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-wider",
                          getActionBadgeColor(log.action)
                        )}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{log.target_type}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <code className="text-[10px] font-black bg-slate-50 p-1.5 rounded-lg text-slate-400 border border-slate-100">
                          {log.ip_address}
                        </code>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="bg-primary/[0.02] animate-in slide-in-from-top-2 duration-300">
                        <td colSpan={6} className="px-8 py-8">
                          <div className="bg-white rounded-3xl border border-primary/10 shadow-2xl shadow-primary/5 p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
                            
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="p-2 bg-primary/5 rounded-xl text-primary">
                                <Code size={18} />
                              </div>
                              <div>
                                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Metadata Payload</h5>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Extended Audit Information</p>
                              </div>
                            </div>
                            
                            <div className="bg-slate-950 rounded-2xl p-6 overflow-hidden shadow-inner border border-white/5">
                              <pre className="text-[12px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed scrollbar-hide">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
                              <div className="flex items-center space-x-2">
                                <span>Target Identifier:</span>
                                <code className="bg-slate-50 px-2 py-0.5 rounded text-primary border border-primary/5">{log.target_id}</code>
                              </div>
                              <span className="opacity-50">Log ID: {log.id}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-dashed border-slate-200">
                        <Activity className="text-slate-300 w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Audit Trail is Empty</h4>
                      <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm font-medium">No administrative actions have been recorded in the current filter context.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.1em]">
            Total Entries: <span className="text-slate-900 font-black">{data?.count || 0}</span>
          </p>
          
          <div className="flex items-center space-x-3">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-primary uppercase tracking-widest shadow-sm">
              Page {page + 1}
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

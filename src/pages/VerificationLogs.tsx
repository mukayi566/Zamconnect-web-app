import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Calendar,
  Building2,
  Fingerprint,
  QrCode,
  ShieldCheck,
  Activity,
  ArrowUpDown,
  History
} from 'lucide-react';
import { verifyService } from '../services/verifyService';
import { Badge } from '../components/ui/Badge';
import { SearchBar } from '../components/ui/SearchBar';
import { formatDateTime } from '../utils/formatters';

export const VerificationLogs: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['verification-logs', page, search, result],
    queryFn: () => verifyService.getLogs({ page, search, result }),
  });

  const totalPages = data?.count ? Math.ceil(data.count / 25) : 0;

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr': return <QrCode size={16} />;
      case 'biometric': return <Fingerprint size={16} />;
      default: return <Search size={16} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary/60 uppercase tracking-[0.2em]">Security Audit</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verification Trail</h2>
          <p className="text-slate-500 font-medium text-sm">Real-time audit of all identity verification events.</p>
        </div>
        <button className="flex items-center space-x-2 bg-white border border-slate-100 hover:bg-slate-50 text-slate-700 transition-all px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm active:scale-95">
          <Download size={18} />
          <span>Export Trail</span>
        </button>
      </div>

      {/* ── Main Log View ── */}
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
                  placeholder="Search by organization, NRC, or IP address..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <select 
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 appearance-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="all">All Verification Results</option>
                  <option value="verified">Verified</option>
                  <option value="failed">Failed</option>
                  <option value="tampered">Tampered</option>
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
                <th className="px-8 py-5">Event Time</th>
                <th className="px-6 py-5">Subject (Citizen)</th>
                <th className="px-6 py-5">Auth Method</th>
                <th className="px-6 py-5">Verification Result</th>
                <th className="px-6 py-5">Issuing Organization</th>
                <th className="px-8 py-5 text-right">Access Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6" colSpan={6}>
                      <div className="h-6 bg-slate-100 rounded-lg w-full"></div>
                    </td>
                  </tr>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((log) => (
                  <tr key={log.id} className="hover:bg-primary/[0.01] transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-[11px] font-black uppercase tracking-wider">{formatDateTime(log.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {log.citizen ? (
                        <div className="flex flex-col">
                          <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors leading-none mb-1">
                            {log.citizen.first_name} {log.citizen.last_name}
                          </p>
                          <p className="text-[10px] font-mono font-black text-primary/60 uppercase tracking-widest">{log.citizen.nrc_number}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[11px] font-black uppercase tracking-widest italic">Anonymized Entry</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2.5 text-slate-600">
                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                          {getMethodIcon(log.method)}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest">{log.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge status={log.result} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                        {log.result}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:border-primary/20 transition-all">
                          <Building2 size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{log.organization || 'Government Node'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <code className="text-[10px] font-black bg-slate-100/50 p-1.5 rounded-lg text-slate-400 border border-slate-100">
                        {log.ip_address}
                      </code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                     <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-dashed border-slate-200">
                        <History className="text-slate-300 w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Trail is empty</h4>
                      <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm font-medium">No verification activities recorded matching these criteria.</p>
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
            Total Records: <span className="text-slate-900 font-black">{data?.count || 0}</span> entries
          </p>
          
          <div className="flex items-center space-x-3">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={18} />
            </button>
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

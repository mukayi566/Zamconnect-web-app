import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Zap, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Mail, 
  Phone,
  Key,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { partnerService, type Partner } from '../services/partnerService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export const ApiControl: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: partnerService.getPartners
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => 
      partnerService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success(`Partner ${data.status} successfully`);
      if (selectedPartner?.id === data.id) setSelectedPartner(data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update partner status');
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: ({ id, keyType }: { id: string; keyType: 'sandbox' | 'production' }) => 
      partnerService.regenerateKey(id, keyType),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success(`${variables.keyType.charAt(0).toUpperCase() + variables.keyType.slice(1)} key regenerated`);
      if (selectedPartner) {
        setSelectedPartner({
          ...selectedPartner,
          ...data
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to regenerate key');
    }
  });

  const filteredPartners = partners?.filter(p => {
    const matchesSearch = 
      p.organisation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={12} className="mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle size={12} className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            API Control Center
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage partner integrations, API access, and security credentials.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Partners', value: partners?.length || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Apps', value: partners?.filter(p => p.status === 'pending').length || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved API Keys', value: partners?.filter(p => p.status === 'approved').length || 0, icon: Key, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revoked/Rejected', value: partners?.filter(p => p.status === 'rejected').length || 0, icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={clsx("p-3 rounded-2xl", stat.bg)}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by organisation, name or email..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-slate-400" size={18} />
          <select 
            className="bg-slate-50 border-none rounded-2xl text-sm py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-40 font-bold text-slate-600"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Applied</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6 h-16 bg-slate-50/20" />
                  </tr>
                ))
              ) : filteredPartners?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No partner applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPartners?.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold">
                          {partner.organisation_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{partner.organisation_name}</p>
                          {partner.website && (
                            <a href={partner.website} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-0.5">
                              {partner.website} <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 text-sm">{partner.contact_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{partner.contact_email}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-tighter">
                        {partner.organisation_type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-600 font-medium">{format(new Date(partner.created_at), 'MMM dd, yyyy')}</p>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(partner.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedPartner(partner)}
                          className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-400 hover:text-primary transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {partner.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateMutation.mutate({ id: partner.id, status: 'approved' })}
                              className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-emerald-200 text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                              title="Approve Partner"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => updateMutation.mutate({ id: partner.id, status: 'rejected' })}
                              className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all shadow-sm"
                              title="Reject Partner"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-32 bg-gradient-to-r from-primary to-primary-dark relative">
              <button 
                onClick={() => setSelectedPartner(null)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
              <div className="absolute -bottom-10 left-10">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center p-4">
                  <div className="w-full h-full bg-primary/5 rounded-2xl flex items-center justify-center text-3xl font-black text-primary">
                    {selectedPartner.organisation_name.charAt(0)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-14 px-10 pb-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedPartner.organisation_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedPartner.status)}
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">• {selectedPartner.organisation_type}</span>
                  </div>
                </div>
                {selectedPartner.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateMutation.mutate({ id: selectedPartner.id, status: 'approved' })}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => updateMutation.mutate({ id: selectedPartner.id, status: 'rejected' })}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center gap-2"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 mt-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Contact Person</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Mail size={16} /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{selectedPartner.contact_name}</p>
                        <p className="text-xs text-slate-500">{selectedPartner.contact_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Phone size={16} /></div>
                      <p className="text-sm font-bold text-slate-900">{selectedPartner.contact_phone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">API Credentials</p>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group/key">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sandbox Key</p>
                        <code className="text-xs text-primary font-mono font-bold break-all">{selectedPartner.sandbox_api_key}</code>
                        <button 
                          onClick={() => regenerateMutation.mutate({ id: selectedPartner.id, keyType: 'sandbox' })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm opacity-0 group-hover/key:opacity-100 transition-opacity"
                          title="Regenerate Sandbox Key"
                        >
                          <Zap size={14} className="text-primary" />
                        </button>
                      </div>
                      {selectedPartner.production_api_key && (
                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 relative group/key">
                          <p className="text-[10px] font-bold text-emerald-600/60 uppercase mb-1">Production Key</p>
                          <code className="text-xs text-emerald-700 font-mono font-bold break-all">{selectedPartner.production_api_key}</code>
                          <button 
                            onClick={() => regenerateMutation.mutate({ id: selectedPartner.id, keyType: 'production' })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm opacity-0 group-hover/key:opacity-100 transition-opacity"
                            title="Regenerate Production Key"
                          >
                            <ShieldCheck size={14} className="text-emerald-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Integration Purpose</p>
                    <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed font-medium">
                      {selectedPartner.purpose}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Requested Data Fields</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.requested_fields.map((field) => (
                        <span key={field} className="px-3 py-1.5 bg-primary/5 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider border border-primary/10">
                          {field.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedPartner.zicta_license && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">ZICTA License</p>
                      <p className="text-sm font-bold text-slate-900">{selectedPartner.zicta_license}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Applied on {format(new Date(selectedPartner.created_at), 'PPPP')}
                </p>
                <button 
                  onClick={() => setSelectedPartner(null)}
                  className="text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  Close Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

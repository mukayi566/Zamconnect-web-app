import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  User,
  History,
  ShieldCheck,
  CreditCard,
  QrCode,
  Activity,
  MoreVertical,
  FileText,
  Camera,
  PenTool,
  ExternalLink,
  Download
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { citizenService } from '../services/citizenService';
import { auditService } from '../services/auditService';
import { useAuthStore } from '../store/authStore';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ImageModal } from '../components/ui/ImageModal';
import { formatDate, formatDateTime } from '../utils/formatters';

export const CitizenDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    action: 'active' | 'suspended' | 'rejected' | 'pending' | null;
  }>({ show: false, action: null });

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const { data: citizen, isLoading } = useQuery({
    queryKey: ['citizen', id],
    queryFn: () => citizenService.getCitizenById(id!),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: async (status: 'active' | 'suspended' | 'rejected' | 'pending') => {
      await citizenService.updateCitizenStatus(id!, status);
      await auditService.logAction({
        actor_id: user?.id,
        actor_email: user?.email,
        action: `${status.toUpperCase()}_CITIZEN`,
        target_id: id,
        target_type: 'citizen',
        metadata: { previous_status: citizen?.data?.status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen', id] });
      setConfirmModal({ show: false, action: null });
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Accessing Secure Records...</p>
    </div>
  );

  if (!citizen?.data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center">
        <ShieldAlert size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-900">Record Not Found</h3>
      <p className="text-slate-500 font-medium">The requested citizen identity could not be located in the national database.</p>
      <button onClick={() => navigate(-1)} className="btn-primary mt-4">Return to Registry</button>
    </div>
  );

  const data = citizen.data;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-3 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-primary transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">Back to Registry</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${data.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} />
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{data.status} IDENTITY</span>
          </div>
          <button className="p-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: ID Card & Quick Info ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Profile Photo Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group">
            <div 
              className="aspect-[4/5] bg-slate-50 flex items-center justify-center relative overflow-hidden cursor-zoom-in"
              onClick={() => data.photo_url && setPreviewImage({ url: data.photo_url, title: 'Profile Photo' })}
            >
              {data.photo_url ? (
                <img src={data.photo_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <User size={80} className="text-slate-300" />
                </div>
              )}
              {/* Status Overlay */}
              <div className="absolute top-6 right-6">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-lg">
                   <Badge status={data.status} className="text-[10px] font-black uppercase tracking-widest border-none p-0">{data.status}</Badge>
                </div>
              </div>
            </div>
            <div className="p-8 text-center bg-white relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">{data.first_name} {data.last_name}</h3>
              <p className="text-primary font-mono font-black mt-2 uppercase tracking-[0.1em] bg-primary/5 inline-block px-3 py-1 rounded-lg border border-primary/10">NRC {data.nrc_number}</p>
            </div>
          </div>

          {/* Premium Digital ID Card Mockup */}
          <div className="relative aspect-[1.58/1] w-full bg-[#004d2d] rounded-3xl p-5 text-white shadow-2xl overflow-hidden group/card ring-1 ring-white/20">
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-zambia-orange/20 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-zambia-green/40 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-xl shadow-black/20 ring-2 ring-white/20">
                    <img src="/zambia-coat-of-arms.svg" alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="leading-none">
                    <p className="text-[9px] font-black tracking-[0.15em] opacity-80 uppercase">Republic of Zambia</p>
                    <p className="text-[13px] font-black tracking-tight mt-0.5">NATIONAL DIGITAL IDENTITY</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-lg px-2 py-1 flex items-center space-x-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                     <span className="text-[8px] font-black uppercase tracking-widest">SECURE</span>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-20 h-24 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 shadow-inner shrink-0">
                  {data.photo_url ? (
                    <img src={data.photo_url} alt="" className="w-full h-full object-cover grayscale brightness-125 contrast-125" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30"><User size={24}/></div>
                  )}
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <p className="text-[7px] font-black uppercase opacity-60 tracking-widest">Holder Name</p>
                    <p className="text-[13px] font-black truncate uppercase leading-none">{data.first_name} {data.last_name}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[7px] font-black uppercase opacity-60 tracking-widest">NRC Number</p>
                      <p className="text-[11px] font-mono font-black tracking-widest">{data.nrc_number}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[7px] font-black uppercase opacity-60 tracking-widest">DOB</p>
                      <p className="text-[10px] font-black uppercase">{formatDate(data.date_of_birth)}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black uppercase opacity-60 tracking-widest">Gender</p>
                      <p className="text-[10px] font-black uppercase">{data.gender}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-1.5 rounded-xl shadow-2xl shrink-0 group-hover/card:scale-110 transition-transform duration-500">
                  <QRCode value={data.qr_payload || data.id} size={50} fgColor="#004d2d" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-black font-mono opacity-40 uppercase tracking-widest">
                  DOC-ID: {data.id.substring(0, 16).toUpperCase()}
                </span>
                <div className="h-1.5 w-16 flex rounded-full overflow-hidden opacity-40">
                  <div className="flex-1 bg-zambia-green"></div>
                  <div className="flex-1 bg-yellow-400"></div>
                  <div className="flex-1 bg-zambia-black"></div>
                  <div className="flex-1 bg-zambia-orange"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Details & Actions ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* Details Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8 border-b border-slate-50 pb-6">
                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Identity Profile</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Core Verification Data</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(data.date_of_birth)} />
                <InfoItem icon={User} label="Gender Identification" value={data.gender.toUpperCase()} />
                <InfoItem icon={MapPin} label="Province of Origin" value={data.province} />
                <InfoItem icon={MapPin} label="Registered District" value={data.district} />
                <InfoItem icon={Phone} label="Primary Contact" value={data.phone || 'Not available'} />
                <InfoItem icon={Mail} label="Secure Email" value={data.email || 'Not available'} />
                <InfoItem icon={Activity} label="Identity Created" value={formatDateTime(data.created_at)} />
                <InfoItem icon={ShieldAlert} label="Assigned Role" value={data.role.toUpperCase()} />
              </div>
            </div>
          </div>
          
          {/* ── Verification Assets Section ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Identity Media (Selfie & Signature) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
              <div className="flex items-center space-x-3 mb-6 relative z-10">
                <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
                  <Camera size={20} />
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">Identity Verification</h4>
              </div>
              
              <div className="space-y-6 relative z-10">
                {/* Selfie Preview */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Live Selfie Capture</p>
                  <div 
                    className="aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group/media relative cursor-zoom-in"
                    onClick={() => data.selfie_url && setPreviewImage({ url: data.selfie_url, title: 'Identity Selfie' })}
                  >
                    {data.selfie_url ? (
                      <>
                        <img src={data.selfie_url} alt="Selfie" className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <div className="p-2 bg-white rounded-full text-slate-900">
                            <ExternalLink size={18} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <Camera size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">No selfie recorded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signature Preview */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Digital Signature</p>
                  <div 
                    className="h-32 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden group/media relative px-4 cursor-zoom-in"
                    onClick={() => data.signature_url && setPreviewImage({ url: data.signature_url, title: 'Citizen Signature' })}
                  >
                    {data.signature_url ? (
                      <>
                        <img src={data.signature_url} alt="Signature" className="w-full h-full object-contain mix-blend-multiply" />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-end p-4">
                          <div className="p-2 bg-white rounded-xl text-slate-900 shadow-lg">
                            <ExternalLink size={16} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <PenTool size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">No signature provided</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Supporting Documents */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
              <div className="flex items-center space-x-3 mb-6 relative z-10">
                <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
                  <FileText size={20} />
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">Supporting Documents</h4>
              </div>

              <div className="space-y-3 relative z-10">
                <DocumentItem 
                  label="NRC Document" 
                  url={data.nrc_url} 
                  icon={CreditCard}
                  color="blue"
                  onPreview={() => data.nrc_url && setPreviewImage({ url: data.nrc_url, title: 'NRC Document' })}
                />
                <DocumentItem 
                  label="Passport Document" 
                  url={data.passport_url} 
                  icon={ShieldCheck}
                  color="indigo"
                  onPreview={() => data.passport_url && setPreviewImage({ url: data.passport_url, title: 'Passport Document' })}
                />
                <DocumentItem 
                  label="Birth Certificate" 
                  url={data.birth_cert_url} 
                  icon={FileText}
                  color="emerald"
                  onPreview={() => data.birth_cert_url && setPreviewImage({ url: data.birth_cert_url, title: 'Birth Certificate' })}
                />
              </div>

              <div className="mt-8 p-5 bg-slate-50 rounded-3xl border border-slate-100 relative z-10">
                <div className="flex items-start space-x-3">
                  <ShieldAlert size={18} className="text-slate-400 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                    All documents are encrypted at rest and only accessible to authorized personnel. Please verify the authenticity of the uploads before approval.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Management Actions */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden ring-1 ring-slate-100">
             <div className="absolute inset-y-0 left-0 w-2 bg-primary" />
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                 <h4 className="text-xl font-black text-slate-900 tracking-tight">Access Control</h4>
                 <p className="text-sm text-slate-500 font-medium mt-1">Manage state and administrative status for this identity.</p>
               </div>
               
               <div className="flex flex-wrap gap-3">
                {data.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => setConfirmModal({ show: true, action: 'active' })}
                      className="group flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-200 active:scale-95"
                    >
                      <CheckCircle size={18} />
                      <span>Approve Profile</span>
                    </button>
                    <button 
                      onClick={() => setConfirmModal({ show: true, action: 'rejected' })}
                      className="flex items-center space-x-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                    >
                       <XCircle size={18} />
                      <span>Reject Application</span>
                    </button>
                  </>
                )}
                
                {data.status === 'active' && (
                  <button 
                    onClick={() => setConfirmModal({ show: true, action: 'suspended' })}
                    className="flex items-center space-x-2 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                  >
                    <ShieldAlert size={18} />
                    <span>Suspend Identity</span>
                  </button>
                )}

                {data.status === 'suspended' && (
                  <button 
                    onClick={() => setConfirmModal({ show: true, action: 'active' })}
                    className="flex items-center space-x-2 bg-primary text-white h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
                  >
                    <CheckCircle size={18} />
                    <span>Restore Identity</span>
                  </button>
                )}
                
                {data.status === 'rejected' && (
                  <button 
                    onClick={() => setConfirmModal({ show: true, action: 'pending' })}
                    className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                  >
                    <span>Reset to Pending</span>
                  </button>
                )}
              </div>
             </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-slate-100 rounded-2xl text-slate-500">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity Log</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Live Identity Audit</p>
                </div>
              </div>
              <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All Logs</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4">Event Type</th>
                    <th className="px-6 py-4">Authorized Actor</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-8 py-4 text-right">Location/Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                          <QrCode size={14} />
                        </div>
                        <span className="font-black text-sm text-slate-700 tracking-tight">Identity Verified</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600">Police Unit 14B</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Officer Badge: 4492</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-slate-400 uppercase">{formatDateTime(new Date())}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">KAFUE CHECKPOINT</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, action: null })}
        onConfirm={() => confirmModal.action && updateStatus.mutate(confirmModal.action)}
        title={`${confirmModal.action?.charAt(0).toUpperCase()}${confirmModal.action?.slice(1)} Citizen Record`}
        message={`Warning: You are about to modify the legal status of ${data.first_name} ${data.last_name} in the national registry. This action will be permanently recorded in the system audit trail with your credentials.`}
        variant={confirmModal.action === 'rejected' || confirmModal.action === 'suspended' ? 'danger' : 'primary'}
        isLoading={updateStatus.isPending}
      />

      <ImageModal 
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ''}
        title={previewImage?.title || ''}
      />
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start space-x-4 group">
    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary/70 transition-colors">{label}</p>
      <p className="text-sm font-black text-slate-900 truncate tracking-tight">{value}</p>
    </div>
  </div>
);

const DocumentItem = ({ label, url, icon: Icon, color, onPreview }: { label: string, url?: string, icon: any, color: string, onPreview: () => void }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-50 text-slate-600'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl hover:border-slate-200 transition-all group/doc">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.slate} group-hover/doc:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{label}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {url ? 'Ready for verification' : 'Not uploaded'}
          </p>
        </div>
      </div>
      {url ? (
        <div className="flex items-center space-x-2">
          <button 
            onClick={onPreview}
            className="p-2.5 bg-slate-50 text-slate-400 hover:bg-primary hover:text-white rounded-xl transition-all"
            title="View Document"
          >
            <ExternalLink size={18} />
          </button>
          <a 
            href={url} 
            download 
            className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
            title="Download"
          >
            <Download size={18} />
          </a>
        </div>
      ) : (
        <div className="p-2.5 text-slate-200">
          <XCircle size={20} />
        </div>
      )}
    </div>
  );
};

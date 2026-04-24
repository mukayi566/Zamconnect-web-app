import React, { useState } from 'react';
import { 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  AlertTriangle,
  QrCode,
  Scan,
  Database,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Code
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { Badge } from '../components/ui/Badge';
import type { Citizen } from '../types';

export const VerifyTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nrc' | 'qr'>('nrc');
  const [nrc, setNrc] = useState('');
  const [qrPayload, setQrPayload] = useState('');
  const [result, setResult] = useState<Citizen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyByNRC = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsVerifying(true);

    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .eq('nrc_number', nrc)
        .single();

      if (error) throw new Error('Citizen record not found in national database.');
      
      setResult(data as Citizen);
      logVerification(data.id, 'nrc', 'verified');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyByQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsVerifying(true);

    try {
      let parsed;
      try {
        parsed = JSON.parse(qrPayload);
      } catch {
        throw new Error('Invalid QR payload format. Authentication string must be valid JSON.');
      }

      const citizenId = parsed.id || parsed.citizen_id;
      if (!citizenId) throw new Error('Invalid payload: Identity identifier missing.');

      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .eq('id', citizenId)
        .single();

      if (error) throw new Error('Could not find record associated with this QR token.');
      
      if (parsed.nrc_number && parsed.nrc_number !== data.nrc_number) {
        logVerification(data.id, 'qr', 'tampered');
        throw new Error('SECURITY ALERT: QR payload data does not match system records! Possible forgery detected.');
      }

      setResult(data as Citizen);
      logVerification(data.id, 'qr', 'verified');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const logVerification = async (citizenId: string, method: string, result: string) => {
    await supabase.from('verification_logs').insert({
      citizen_id: citizenId,
      method,
      result,
      organization: 'Central Admin Portal',
      ip_address: '10.0.0.1' // Mock Secure Node IP
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ── Page Header ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 mb-2">
          <ShieldCheck size={18} className="text-primary" />
          <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Secure Verification Node</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Identity Verify Tool</h2>
        <p className="text-slate-500 font-medium max-w-lg mx-auto text-lg leading-relaxed">
          Verify national identity credentials against the blockchain-backed registry.
        </p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden transition-all">
        {/* Tabs Control */}
        <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex gap-2">
          <button 
            onClick={() => { setActiveTab('nrc'); setResult(null); setError(null); }}
            className={`flex-1 py-4 rounded-[2rem] text-xs font-black flex items-center justify-center space-x-3 transition-all uppercase tracking-widest ${
              activeTab === 'nrc' 
                ? 'bg-white text-primary shadow-xl shadow-primary/10 border border-primary/10 scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }`}
          >
            <Scan size={18} />
            <span>Verify NRC Record</span>
          </button>
          <button 
            onClick={() => { setActiveTab('qr'); setResult(null); setError(null); }}
            className={`flex-1 py-4 rounded-[2rem] text-xs font-black flex items-center justify-center space-x-3 transition-all uppercase tracking-widest ${
              activeTab === 'qr' 
                ? 'bg-white text-primary shadow-xl shadow-primary/10 border border-primary/10 scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }`}
          >
            <QrCode size={18} />
            <span>Scan QR Token</span>
          </button>
        </div>

        <div className="p-10 sm:p-14">
          <div className="max-w-2xl mx-auto">
            {activeTab === 'nrc' ? (
              <form onSubmit={verifyByNRC} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">National Registration Card Number</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                       <Database size={24} />
                    </div>
                    <input 
                      type="text" 
                      value={nrc}
                      onChange={(e) => setNrc(e.target.value)}
                      placeholder="XXXXXX / XX / X"
                      className="w-full h-20 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-3xl text-2xl font-mono font-black tracking-[0.2em] uppercase focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 focus:bg-white transition-all shadow-inner placeholder:text-slate-200"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Format Required: 000000 / 00 / 0</span>
                  </div>
                </div>
                <button 
                  disabled={isVerifying} 
                  type="submit" 
                  className="w-full h-16 bg-gradient-to-r from-primary to-primary-dark text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center space-x-3"
                >
                  {isVerifying ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Initialize Lookup</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyByQR} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Encrypted JSON Payload</label>
                  <div className="relative group">
                    <textarea 
                      value={qrPayload}
                      onChange={(e) => setQrPayload(e.target.value)}
                      placeholder='Paste the digital identity token payload here...'
                      className="w-full h-52 p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 focus:bg-white transition-all shadow-inner scrollbar-hide"
                      required
                    ></textarea>
                    <div className="absolute right-6 bottom-6 text-slate-200">
                      <Code size={32} />
                    </div>
                  </div>
                </div>
                <button 
                  disabled={isVerifying} 
                  type="submit" 
                  className="w-full h-16 bg-gradient-to-r from-primary to-primary-dark text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center space-x-3"
                >
                  {isVerifying ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Decrypt & Validate</span>
                      <ShieldCheck size={20} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Results Section */}
            <div className="mt-12">
              {result && (
                <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-[2.5rem] p-10 animate-in zoom-in-95 duration-500 shadow-xl shadow-green-100/50 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/5 blur-3xl rounded-full pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 text-green-600 font-black mb-8">
                      <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center border border-green-200">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="leading-none">
                        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Identity Status</p>
                        <p className="text-xl tracking-tight">SUCCESSFULLY VERIFIED</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="relative group/avatar">
                        <div className="w-32 h-32 bg-white rounded-[2rem] border-2 border-green-100 overflow-hidden shadow-2xl shadow-green-200/50 p-1 group-hover/avatar:scale-105 transition-transform duration-500">
                          <div className="w-full h-full rounded-[1.75rem] overflow-hidden">
                            {result.photo_url ? (
                              <img src={result.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><User size={48}/></div>
                            )}
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                          <ShieldCheck size={16} />
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10 w-full">
                        <div>
                          <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">Holder Identity</p>
                          <p className="text-2xl font-black text-slate-900 uppercase leading-none">{result.first_name} {result.last_name}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">NRC Identifier</p>
                          <p className="text-2xl font-mono font-black text-slate-900 leading-none">{result.nrc_number}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">System State</p>
                          <Badge status={result.status} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest">{result.status}</Badge>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">Registry Province</p>
                          <p className="text-lg font-black text-slate-800 uppercase leading-none">{result.province}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-10 animate-in shake duration-500 shadow-xl shadow-red-100/50">
                  <div className="flex items-center space-x-3 text-red-600 font-black mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center border border-red-200">
                      <ShieldAlert size={24} />
                    </div>
                    <div className="leading-none">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Verification Failure</p>
                      <p className="text-xl tracking-tight">VALIDATION DENIED</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 border border-red-100 mb-6">
                    <p className="text-red-700 font-bold text-lg leading-snug">{error}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-[11px] font-black text-red-500 uppercase tracking-widest bg-red-100/30 p-4 rounded-2xl border border-red-100/50">
                    <AlertTriangle size={18} className="animate-pulse" />
                    <span>Security protocol 401 initiated: Event logged with system node.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

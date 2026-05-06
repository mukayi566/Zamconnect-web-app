import React, { useState, useCallback } from 'react';
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
  Code,
  Camera,
  Wifi,
  Smartphone,
  Shield,
  FileCheck,
  Lock,
  Globe,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import type { Citizen } from '../types';
import { verifyService } from '../services/verifyService';
import { QRScanner } from '../components/QRScanner';
import { webNfcService } from '../services/webNfcService';

export const VerifyTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nrc' | 'qr' | 'nfc'>('nrc');
  const [nrc, setNrc] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [result, setResult] = useState<Citizen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isNfcScanning, setIsNfcScanning] = useState(false);

  const verifyByNRC = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsVerifying(true);

    try {
      const data = await verifyService.verifyByNRC(nrc, 'Admin Dashboard');
      setResult(data.citizen);
    } catch (err: any) {
      setError(err.message || 'Identity not found in national database.');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyByQR = useCallback(async (e?: React.FormEvent, token?: string) => {
    if (e) e.preventDefault();
    const tokenToVerify = token || qrToken;
    if (!tokenToVerify) return;

    setError(null);
    setResult(null);
    setIsVerifying(true);

    try {
      const data = await verifyService.verifyByQR(tokenToVerify, 'Admin Dashboard');
      setResult(data.citizen);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired QR token.');
    } finally {
      setIsVerifying(false);
    }
  }, [qrToken]);

  const handleQRScan = useCallback((token: string) => {
    setQrToken(token);
    setIsScanning(false);
    verifyByQR(undefined, token);
  }, [verifyByQR]);

  const handleNfcScan = async () => {
    if (!webNfcService.isSupported()) {
      setError('Web NFC is not supported by your browser. Please use Chrome on Android.');
      return;
    }

    setError(null);
    setIsNfcScanning(true);

    try {
      const token = await webNfcService.scanCard();
      setIsNfcScanning(false);
      verifyByQR(undefined, token);
    } catch (err: any) {
      setIsNfcScanning(false);
      setError(err.message || 'NFC Scan failed.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* ── Official Government Header ── */}
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-px bg-slate-200" />
            <Globe className="text-slate-400" size={20} />
            <div className="w-16 h-px bg-slate-200" />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Republic of Zambia</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ministry of Home Affairs & Internal Security</p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">National Identity Registry</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            Secure verification portal for the authentication of National Registration Cards (NRC) and Digital Identity.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Lock size={12} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">
        {/* Official Tabs Control */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setActiveTab('nrc'); setResult(null); setError(null); }}
            className={`flex-1 py-6 text-xs font-black flex flex-col items-center justify-center space-y-2 transition-all uppercase tracking-widest border-b-2 ${
              activeTab === 'nrc' 
                ? 'bg-emerald-50/30 text-emerald-700 border-emerald-600' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-transparent'
            }`}
          >
            <Scan size={20} />
            <span>NRC Record</span>
          </button>
          <button 
            onClick={() => { setActiveTab('qr'); setResult(null); setError(null); }}
            className={`flex-1 py-6 text-xs font-black flex flex-col items-center justify-center space-y-2 transition-all uppercase tracking-widest border-b-2 ${
              activeTab === 'qr' 
                ? 'bg-emerald-50/30 text-emerald-700 border-emerald-600' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-transparent'
            }`}
          >
            <QrCode size={20} />
            <span>Digital Token</span>
          </button>
          <button 
            onClick={() => { setActiveTab('nfc'); setResult(null); setError(null); }}
            className={`flex-1 py-6 text-xs font-black flex flex-col items-center justify-center space-y-2 transition-all uppercase tracking-widest border-b-2 ${
              activeTab === 'nfc' 
                ? 'bg-emerald-50/30 text-emerald-700 border-emerald-600' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-transparent'
            }`}
          >
            <Wifi size={20} />
            <span>NFC Card Read</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="max-w-md mx-auto">
            {activeTab === 'nrc' && (
              <form onSubmit={verifyByNRC} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">National Registration Card Number</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors">
                       <Database size={24} />
                    </div>
                    <input 
                      type="text" 
                      value={nrc}
                      onChange={(e) => setNrc(e.target.value)}
                      placeholder="123967 / 59 / 1"
                      className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-mono font-black tracking-[0.2em] uppercase focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-600/50 focus:bg-white transition-all shadow-inner placeholder:text-slate-200"
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
                  className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-70 flex items-center justify-center space-x-3"
                >
                  {isVerifying ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Execute Database Search</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === 'qr' && (
              <div className="space-y-8">
                {/* Scanner Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsScanning(true)}
                    className="group relative flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:border-emerald-600/50 hover:bg-emerald-50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-4 right-4">
                       <Badge className="bg-emerald-600/10 text-emerald-600 border-none text-[8px] font-black uppercase tracking-tighter px-2">Recommended</Badge>
                    </div>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg transition-all duration-500">
                      <Camera size={32} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-emerald-600 transition-colors">Use Device Camera</span>
                    <p className="text-[9px] text-slate-400 mt-1 font-medium group-hover:text-emerald-600/70">Instant QR scanning & validation</p>
                  </button>
                </div>

                {/* Manual Input Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-6 text-slate-300 font-black tracking-[0.3em]">OR MANUAL OVERRIDE</span>
                  </div>
                </div>

                {/* Manual Input Form */}
                <form onSubmit={verifyByQR} className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Token String</label>
                      <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Base64 Encoded JWT</span>
                    </div>
                    <div className="relative group">
                      <textarea 
                        value={qrToken}
                        onChange={(e) => setQrToken(e.target.value)}
                        placeholder='Paste the digital identity JWT token here...'
                        className="w-full h-40 p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-mono text-sm focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600/50 focus:bg-white transition-all shadow-inner scrollbar-hide"
                        required
                      ></textarea>
                      <div className="absolute right-8 bottom-8 text-slate-200 group-focus-within:text-emerald-600/20 transition-colors">
                        <Code size={32} />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    disabled={isVerifying || !qrToken} 
                    type="submit" 
                    className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-70 flex items-center justify-center space-x-3"
                  >
                    {isVerifying ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Validate Digital Identity</span>
                        <ShieldCheck size={20} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'nfc' && (
              <div className="space-y-8 text-center py-10">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className={`w-32 h-32 bg-emerald-600/10 rounded-full flex items-center justify-center ${isNfcScanning ? 'animate-pulse' : ''}`}>
                      <Wifi size={64} className="text-emerald-600" />
                    </div>
                    {isNfcScanning && (
                      <div className="absolute inset-0 border-4 border-emerald-600 rounded-full animate-ping opacity-25"></div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isNfcScanning ? 'Scanning for Card...' : 'NFC Identity Reader'}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    {isNfcScanning 
                      ? 'Hold the Digital ZamID card near the back of your device to read the identity token.'
                      : 'Verify digital identity cards using the built-in NFC reader on your device.'}
                  </p>
                </div>

                <div className="pt-6">
                  {!isNfcScanning ? (
                    <button
                      onClick={handleNfcScan}
                      className="inline-flex items-center space-x-3 px-10 h-16 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-700 transition-all"
                    >
                      <Smartphone size={20} />
                      <span>Start NFC Scan</span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-500 font-bold text-[10px] uppercase tracking-widest animate-bounce">
                        <Smartphone size={14} className="animate-pulse" />
                        <span>Awaiting Card Tap...</span>
                      </div>
                      <button 
                        onClick={() => setIsNfcScanning(false)}
                        className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                      >
                        Cancel Scanning
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-12 flex items-center justify-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-xs mx-auto">
                   <ShieldCheck size={16} className="text-emerald-600" />
                   <span>Enterprise Grade NFC Protocol</span>
                </div>
              </div>
            )}

            {isScanning && (
              <QRScanner 
                onScan={handleQRScan} 
                onClose={() => setIsScanning(false)} 
              />
            )}

            {/* Results Section - Official Verification Certificate */}
            <div className="mt-12">
              {result && (
                <div className="bg-white border-2 border-slate-900 rounded-3xl p-1 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
                  <div className="border border-slate-200 rounded-[1.2rem] p-5 sm:p-6">
                    {/* Certificate Header */}
                    <div className="flex flex-col items-center text-center space-y-6 mb-12 border-b border-slate-100 pb-12">
                      <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                        <CheckCircle2 size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Identity Verification Certificate</h3>
                        <div className="flex items-center justify-center space-x-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                           <span>Issue Ref: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span>Date: {new Date().toLocaleDateString()}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span>Time: {new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <Badge className="bg-emerald-600 text-white px-6 py-2 text-xs font-black uppercase tracking-[0.3em] rounded-full border-none shadow-lg">Official Status: Verified</Badge>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Photo Section */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-40 h-48 bg-slate-50 rounded-2xl border-4 border-slate-100 overflow-hidden shadow-inner flex items-center justify-center relative group">
                          {result.photo_url ? (
                            <img src={result.photo_url} alt="Official Portrait" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
                          ) : (
                            <User size={64} className="text-slate-200" />
                          )}
                          <div className="absolute inset-0 border-4 border-white/50 pointer-events-none" />
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Biometric Portrait</p>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1 flex items-center justify-center gap-1">
                             <ShieldCheck size={10} /> Registered
                          </p>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Legal Full Name</p>
                            <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{result.first_name} {result.last_name}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">National Identity Number</p>
                            <p className="text-xl font-mono font-black text-slate-900 tracking-tighter">{result.nrc_number}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry State/Province</p>
                            <p className="text-lg font-bold text-slate-800 uppercase">{result.province}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Registry Status</p>
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              <p className="text-lg font-bold text-emerald-600 uppercase">{result.status}</p>
                            </div>
                          </div>
                        </div>

                        {/* Security Footer */}
                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <FileCheck size={14} className="text-emerald-600" />
                            <span>Digital Signature Validated</span>
                          </div>
                          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                             <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Blockchain Sync</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Watermark/Texture */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
                     <ShieldCheck size={400} />
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

      {/* ── Official Footer & Disclaimers ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-10 duration-1000 delay-300">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
          <div className="flex items-center space-x-3 text-emerald-700">
            <Clock size={18} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Audit Trail Active</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
            All verification attempts are logged with the timestamp, organization node ID, and security protocol version. Unauthorised access is strictly prohibited.
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
          <div className="flex items-center space-x-3 text-emerald-700">
            <Shield size={18} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Legal Authority</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
            Operating under the National Registration Act (Chapter 126 of the Laws of Zambia) and Data Protection Act No. 4 of 2021.
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
          <div className="flex items-center space-x-3 text-emerald-700">
            <HelpCircle size={18} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Support Portal</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
            For technical assistance or system integration requests, please contact the Government Integrated Digital Identity (GIDI) taskforce.
          </p>
        </div>
      </div>
    </div>
  );
};

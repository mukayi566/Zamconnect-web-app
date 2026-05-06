import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const containerId = 'qr-reader';

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        // Slight delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mounted) return;

        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.7);
              return {
                width: qrboxSize,
                height: qrboxSize
              };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (mounted) {
              onScan(decodedText);
              // stopScanner will be called by cleanup or manually if needed
            }
          },
          () => {
            // Silently ignore scan errors
          }
        );
        
        if (mounted) setIsInitializing(false);
      } catch (err: any) {
        console.error('Failed to start scanner:', err);
        if (mounted) {
          setError(err?.message || 'Could not access camera. Please ensure permissions are granted.');
          setIsInitializing(false);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(err => console.error('Error stopping scanner:', err));
        }
      }
    };
  }, []);

  const handleRetry = () => {
    window.location.reload(); // Simple way to reset everything if it hangs
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Scan QR Token</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Identity Verification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative p-6">
          <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-slate-950 border-4 border-slate-100 shadow-inner">
            <div 
              id={containerId} 
              className="w-full h-full"
            ></div>
            
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Initializing Optics...</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest">Camera Access Error</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">{error}</p>
                </div>
                <button 
                  onClick={handleRetry}
                  className="flex items-center space-x-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>Restart Session</span>
                </button>
              </div>
            )}

            {!error && !isInitializing && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[70%] h-[70%] relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl animate-pulse"></div>
                  
                  {/* Scanning Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scan"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 flex flex-col items-center space-y-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Position the digital identity QR code<br />within the scanning frame
          </p>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encrypted Verification Link</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};


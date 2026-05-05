import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, ShieldCheck } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader';

  useEffect(() => {
    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode(containerId);
        
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          () => {
            // Silently ignore scan errors (it's common during scanning)
          }
        );
      } catch (err) {
        console.error('Failed to start scanner:', err);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
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
          <div 
            id={containerId} 
            className="w-full aspect-square rounded-[2rem] overflow-hidden bg-slate-900 border-4 border-slate-100 shadow-inner"
          ></div>
          
          {/* Overlay Guide */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[250px] h-[250px] relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 flex flex-col items-center space-y-4">
          <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">
            Position the digital identity QR code<br />within the selection frame
          </p>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure End-to-End Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

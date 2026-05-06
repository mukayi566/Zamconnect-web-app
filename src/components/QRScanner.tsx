import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, ShieldCheck, AlertCircle, RefreshCw, Zap, ZapOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const onScanRef = useRef(onScan);

  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  const stopStream = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Try BarcodeDetector (Chrome/Android native)
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      detector.detect(canvas).then((barcodes: any[]) => {
        if (barcodes.length > 0) {
          onScanRef.current(barcodes[0].rawValue);
          return;
        }
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }).catch(() => {
        animFrameRef.current = requestAnimationFrame(scanFrame);
      });
    } else {
      // Fallback: use jsQR via dynamic import
      import('jsqr').then(({ default: jsQR }) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code) {
          onScanRef.current(code.data);
          return;
        }
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }).catch(() => {
        animFrameRef.current = requestAnimationFrame(scanFrame);
      });
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setError(null);
    setIsInitializing(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera API not supported in this browser.');
      setIsInitializing(false);
      return;
    }

    const constraints: MediaStreamConstraints[] = [
      { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'user' } },
      { video: true },
    ];

    let stream: MediaStream | null = null;
    for (const c of constraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c);
        break;
      } catch {
        // try next
      }
    }

    if (!stream) {
      setError('Could not access camera. Please allow camera permission and retry.');
      setIsInitializing(false);
      return;
    }

    streamRef.current = stream;
    const track = stream.getVideoTracks()[0];
    trackRef.current = track;

    // Check torch support
    const caps = track.getCapabilities() as any;
    if (caps?.torch) setHasTorch(true);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().then(() => {
          setIsInitializing(false);
          animFrameRef.current = requestAnimationFrame(scanFrame);
        }).catch(err => {
          setError(`Video play error: ${err.message}`);
          setIsInitializing(false);
        });
      };
    }
  }, [stopStream, scanFrame]);

  useEffect(() => {
    startCamera();
    return () => stopStream();
  }, [startCamera, stopStream]);

  const toggleTorch = async () => {
    if (!trackRef.current || !hasTorch) return;
    try {
      const next = !torchEnabled;
      await trackRef.current.applyConstraints({ advanced: [{ torch: next }] } as any);
      setTorchEnabled(next);
    } catch (e) {
      console.warn('Torch toggle failed', e);
    }
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
          <div className="flex items-center space-x-2">
            {hasTorch && !error && !isInitializing && (
              <button
                onClick={toggleTorch}
                className={`p-3 rounded-2xl transition-all border ${
                  torchEnabled
                    ? 'bg-amber-100 text-amber-600 border-amber-200'
                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {torchEnabled ? <Zap size={20} /> : <ZapOff size={20} />}
              </button>
            )}
            <button
              onClick={() => { stopStream(); onClose(); }}
              className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="relative p-6">
          <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-slate-950 border-4 border-slate-100 shadow-inner">
            {/* Native video element — no library fighting our CSS */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: isInitializing || error ? 'none' : 'block' }}
            />
            {/* Hidden canvas for frame analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Requesting Camera...</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Please allow camera access in your browser</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-black uppercase text-sm tracking-widest">Camera Error</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={startCamera}
                  className="flex items-center space-x-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Scan overlay corners */}
            {!error && !isInitializing && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[70%] h-[70%] relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl animate-pulse" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl animate-pulse" />
                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scan" />
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

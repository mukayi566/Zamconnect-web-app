import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, ShieldCheck, AlertCircle, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number; max: number; step: number } | null>(null);
  const isTransitioning = useRef(false);
  const onScanRef = useRef(onScan);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const containerId = 'qr-reader';

  // Keep onScanRef up to date
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const startScanner = useCallback(async () => {
    if (isTransitioning.current) {
      console.warn('Scanner is already transitioning, ignoring start request.');
      return;
    }
    
    console.log('Starting scanner initialization...');
    try {
      isTransitioning.current = true;
      setIsInitializing(true);
      setError(null);
      setNeedsPermission(false);
      
      // 1. Check for secure context
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        const msg = 'Camera access requires a secure (HTTPS) connection.';
        setError(msg);
        console.error(msg);
        return;
      }

      // 2. Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = 'Your browser does not support camera access or it is disabled.';
        setError(msg);
        console.error(msg);
        return;
      }

      // 3. Pre-check for cameras
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setError('No cameras found on this device.');
          return;
        }
        console.log(`Found ${cameras.length} cameras.`);
      } catch (err: any) {
        console.warn('Error fetching cameras:', err);
        const errStr = err.toString().toLowerCase();
        if (errStr.includes('notallowederror') || errStr.includes('permission denied')) {
          setNeedsPermission(true);
          return;
        }
      }

      // Ensure DOM element is ready
      const container = document.getElementById(containerId);
      if (!container) {
        console.error('Scanner container not found in DOM');
        return;
      }

      // Reuse or create scanner instance
      if (!scannerRef.current) {
        console.log('Creating new Html5Qrcode instance');
        scannerRef.current = new Html5Qrcode(containerId, { verbose: true });
      }

      const scanner = scannerRef.current;

      // If already scanning, stop it first
      if (scanner.isScanning) {
        console.log('Scanner already running, stopping before restart...');
        await scanner.stop();
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const config = {
        fps: 15, // Slightly higher FPS for smoother experience
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.7);
          return {
            width: qrboxSize,
            height: qrboxSize
          };
        },
        // Remove hard aspect ratio constraint for better compatibility
      };

      try {
        console.log('Attempting to start camera with environment facing mode...');
        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            console.log('QR Code decoded successfully');
            onScanRef.current(decodedText);
          },
          () => {} // Low-level scan errors are ignored to avoid console spam
        );
      } catch (err) {
        console.warn('Failed to start with environment camera, retrying with user camera...', err);
        try {
          await scanner.start(
            { facingMode: 'user' }, 
            config,
            (decodedText) => onScanRef.current(decodedText),
            () => {}
          );
        } catch (secondErr) {
          console.warn('Failed to start with user camera, retrying with default...', secondErr);
          // If facingMode fails, we need to get the camera ID
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            await scanner.start(
              cameras[0].id,
              config,
              (decodedText) => onScanRef.current(decodedText),
              () => {}
            );
          } else {
            throw new Error('No cameras available');
          }
        }
      }
      
      console.log('Scanner started successfully');
      setIsInitializing(false);
      
      // Try to get camera capabilities for zoom
      setTimeout(async () => {
        try {
          const videoElement = container.querySelector('video') as HTMLVideoElement;
          if (videoElement && videoElement.srcObject instanceof MediaStream) {
            const track = videoElement.srcObject.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            
            if (capabilities.zoom) {
              setZoomCapabilities({
                min: capabilities.zoom.min,
                max: capabilities.zoom.max,
                step: capabilities.zoom.step || 0.1
              });
              setZoom(capabilities.zoom.min);
              trackRef.current = track;
            }
          }
        } catch (err) {
          console.warn('Camera zoom capabilities check failed:', err);
        }
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      const errorMessage = (err?.message || err?.toString() || '').toLowerCase();
      
      if (errorMessage.includes('notallowederror') || errorMessage.includes('permission denied')) {
        setNeedsPermission(true);
      } else if (errorMessage.includes('notreadableerror') || errorMessage.includes('trackstarterror')) {
        setError('Camera is in use or hardware error occurred. Please refresh or close other apps.');
      } else if (errorMessage.includes('notfounderror')) {
        setError('No camera found.');
      } else if (!errorMessage.includes('already under transition')) {
        setError(`Camera error: ${err?.message || 'Check permissions'}`);
      }
      setIsInitializing(false);
    } finally {
      isTransitioning.current = false;
    }
  }, [containerId]);

  useEffect(() => {
    startScanner();

    return () => {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          scanner.stop().then(() => scanner.clear()).catch(err => console.error('Error stopping scanner:', err));
        } else {
          scanner.clear();
        }
      }
    };
  }, [startScanner]);

  const handleRetry = () => {
    startScanner();
  };

  const handleZoomChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setZoom(value);
    if (trackRef.current) {
      try {
        await trackRef.current.applyConstraints({
          advanced: [{ zoom: value }]
        } as any);
      } catch (err) {
        console.error('Failed to apply zoom:', err);
      }
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
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Requesting Permission...</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Please allow camera access in your browser</p>
                </div>
              </div>
            )}

            {needsPermission && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-600/20 rounded-3xl flex items-center justify-center text-emerald-600 animate-pulse">
                  <Camera size={32} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-white font-black uppercase text-sm tracking-widest">Camera Access Required</h4>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                      To scan digital identity tokens, we need permission to use your device's camera.
                    </p>
                  </div>
                  
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mb-1">How to enable:</p>
                    <p className="text-slate-500 text-[9px] font-bold leading-relaxed">
                      If you've previously blocked access, click the <span className="text-slate-300">lock</span> or <span className="text-slate-300">camera icon</span> in your browser's address bar and select <span className="text-emerald-500">"Allow"</span>.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => startScanner()}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
                >
                  Request Permission Again
                </button>
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

          {/* Zoom Control */}
          {zoomCapabilities && (
            <div className="mt-8 px-4 py-6 bg-slate-50/80 backdrop-blur-sm rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Precision Zoom Control</span>
                </div>
                <span className="text-[11px] font-black text-white bg-slate-900 px-3 py-1 rounded-full shadow-lg">
                  {zoom.toFixed(1)}x
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    const newValue = Math.max(zoomCapabilities.min, zoom - zoomCapabilities.step * 5);
                    handleZoomChange({ target: { value: newValue.toString() } } as any);
                  }}
                  className="p-3 bg-white text-slate-400 hover:text-emerald-600 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90"
                >
                  <ZoomOut size={18} />
                </button>
                
                <div className="relative flex-1 group">
                  <input
                    type="range"
                    min={zoomCapabilities.min}
                    max={zoomCapabilities.max}
                    step={zoomCapabilities.step}
                    value={zoom}
                    onChange={handleZoomChange}
                    className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <button 
                  onClick={() => {
                    const newValue = Math.min(zoomCapabilities.max, zoom + zoomCapabilities.step * 5);
                    handleZoomChange({ target: { value: newValue.toString() } } as any);
                  }}
                  className="p-3 bg-white text-slate-400 hover:text-emerald-600 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
              
              <div className="flex justify-between px-2">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Wide Angle</span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Telephoto</span>
              </div>
            </div>
          )}
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


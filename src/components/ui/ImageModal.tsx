import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Document Viewer</p>
          </div>
          <div className="flex items-center space-x-2">
            <a 
              href={imageUrl} 
              download 
              className="p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
              title="Download Document"
            >
              <Download size={20} />
            </a>
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 bg-slate-50 text-slate-600 hover:bg-primary hover:text-white rounded-xl transition-all"
              title="Open in New Tab"
            >
              <ExternalLink size={20} />
            </a>
            <button 
              onClick={onClose}
              className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Image Area */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-8 flex items-center justify-center min-h-[50vh]">
          <img 
            src={imageUrl} 
            alt={title} 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
          />
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            ZamID National Identity System • Secure Document Access
          </p>
        </div>
      </div>
    </div>
  );
};

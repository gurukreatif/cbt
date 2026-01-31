
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  type?: 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Ya, Lanjutkan",
  type = 'danger'
}) => {
  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px] animate-in fade-in duration-200">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden border border-gray-300 animate-in zoom-in duration-200">
        <div className={`h-1.5 w-full ${type === 'danger' ? 'bg-red-600' : 'bg-orange-500'}`}></div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed font-medium uppercase tracking-tight italic">
            {message}
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex gap-2 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`flex-[2] px-4 py-2 rounded-sm text-white text-[10px] font-black uppercase tracking-widest shadow-sm transition-all hover:brightness-110 ${
              type === 'danger' ? 'bg-red-600' : 'bg-orange-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

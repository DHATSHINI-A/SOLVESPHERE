import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, clearNotification } = useAuth();

  const activeToasts = notifications.slice(0, 3);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => {
        const icons = {
          info: <Info className="w-4 h-4 text-[#3E5C9A]" />,
          success: <CheckCircle2 className="w-4 h-4 text-[#1F9D55]" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#E8A93B]" />,
          ai_match: <Sparkles className="w-4 h-4 text-[#FF6B4A] animate-pulse" />,
        };

        const borders = {
          info: 'border-[#3E5C9A]/30 bg-white/95 text-[#1A1D29]',
          success: 'border-[#1F9D55]/30 bg-white/95 text-[#1A1D29]',
          warning: 'border-[#E8A93B]/30 bg-white/95 text-[#1A1D29]',
          ai_match: 'border-[#FF6B4A]/40 bg-white/95 text-[#1A1D29]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200 ${
              borders[toast.type || 'info']
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 shrink-0">{icons[toast.type || 'info']}</div>
              <div>
                <p className="text-xs font-bold text-[#1E2A5E]">{toast.title}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => clearNotification(toast.id)}
              className="text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

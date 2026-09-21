import React, { useEffect, useState } from 'react';
import { Bookmark, Check, Copy, Info, X, Trash2, Sparkles } from 'lucide-react';
import { Toast, subscribeToasts, dismissToast } from '../lib/toast';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isFavorite = toast.type === 'favorite';
        const isRemove = toast.type === 'remove';
        const isCopied = toast.type === 'copied';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-up ${
              isFavorite
                ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/25'
                : isRemove
                ? 'bg-slate-900 text-slate-100 border-slate-700 shadow-black/30'
                : isCopied
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/25'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isFavorite
                    ? 'bg-white/20 text-white'
                    : isRemove
                    ? 'bg-rose-500/20 text-rose-400'
                    : isCopied
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {isFavorite && <Bookmark className="w-4 h-4 fill-white" />}
                {isRemove && <Trash2 className="w-4 h-4" />}
                {isCopied && <Copy className="w-4 h-4" />}
                {!isFavorite && !isRemove && !isCopied && <Check className="w-4 h-4" />}
              </div>

              <div>
                <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
                {toast.description && (
                  <p
                    className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${
                      isFavorite || isCopied ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {toast.description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 transition shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

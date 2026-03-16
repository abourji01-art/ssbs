import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

/* ── Types ── */
export type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

/* ── Context ── */
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

/* ── Provider ── */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — bottom right */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/* ── Single toast item ── */
const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const colorMap = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-500',
    text: 'text-emerald-800',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    text: 'text-amber-800',
  },
};

const ToastItem = ({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) => {
  const Icon = iconMap[t.type];
  const colors = colorMap[t.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg ${colors.bg} animate-slide-in-right`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors.icon}`} />
      <p className={`text-sm font-medium flex-1 ${colors.text}`}>{t.message}</p>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

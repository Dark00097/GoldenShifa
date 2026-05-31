'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(message: string, type: Toast['type']) {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }

  const value = useMemo(
    () => ({
      success: (message: string) => push(message, 'success'),
      error: (message: string) => push(message, 'error')
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-50 grid w-[min(360px,calc(100vw-2rem))] gap-3">
        {toasts.map((toast) => {
          const Icon = toast.type === 'success' ? CheckCircle2 : XCircle;
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-lg border bg-white p-4 shadow-soft ${
                toast.type === 'success' ? 'border-leaf/30 text-leaf' : 'border-red-200 text-red-700'
              }`}
            >
              <Icon size={20} />
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast doit etre utilise dans ToastProvider.');
  return context;
}

import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  readonly id: string;
  readonly type: ToastType;
  readonly message: string;
  readonly title?: string;
  readonly duration?: number;
}

export interface ToastContextValue {
  readonly toast: {
    readonly success: (message: string, title?: string, duration?: number) => void;
    readonly error: (message: string, title?: string, duration?: number) => void;
    readonly warning: (message: string, title?: string, duration?: number) => void;
    readonly info: (message: string, title?: string, duration?: number) => void;
    readonly dismiss: (id: string) => void;
  };
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue['toast'] {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

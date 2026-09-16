import React from 'react';
import { ToastProvider } from '../components/feedback/Toast';
import { AuthProvider } from '../routes/AuthProvider';
import { ClientProvider } from '../routes/ClientProvider';

export interface ProvidersProps {
  readonly children: React.ReactNode;
}

/**
 * Root Providers Tree
 *
 * Wraps the application with global authentication state, client organization context,
 * and user interface feedback providers.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ClientProvider>
        <ToastProvider>{children}</ToastProvider>
      </ClientProvider>
    </AuthProvider>
  );
}

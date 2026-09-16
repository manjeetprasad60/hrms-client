import React from 'react';
import { cn } from '../utils/cn';

export interface AuthLayoutProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
  readonly className?: string;
}

export function AuthLayout({
  children,
  title = 'HRIS Client Portal',
  subtitle = 'Enterprise Human Resources Administration',
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn('auth-layout-container', className)}
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-app)',
        padding: 'var(--space-6) var(--space-4)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 'var(--text-xl)',
            boxShadow: 'var(--elevation-2)',
          }}
        >
          C
        </div>
        <h1
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {subtitle}
        </p>
      </div>

      {/* Auth Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {children}
      </div>

      {/* Footer Disclaimer */}
      <footer
        style={{
          marginTop: 'var(--space-8)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        <p>© 2026 HRIS Platform. Secure Client Administration.</p>
      </footer>
    </div>
  );
}

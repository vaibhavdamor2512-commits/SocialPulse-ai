/**
 * src/components/providers/index.tsx
 * Composes all app-level providers: TanStack Query, Toast, Theme.
 * Used in the root layout so all child components have access.
 */
'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#161b27',
            color: '#e5e7eb',
            border: '1px solid #1e2535',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#4ade80', secondary: '#161b27' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#161b27' },
          },
        }}
      />

      {/* Query devtools (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}

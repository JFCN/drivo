'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { authApi } from '@/features/auth/api';
import { ApiError, setUnauthorizedHandler } from '@/lib/api-client';

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, refetchOnWindowFocus: false, staleTime: 30 * 1000 },
      mutations: { retry: false },
    },
  });

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    let redirecting = false;
    setUnauthorizedHandler(() => {
      if (redirecting) {
        return;
      }
      redirecting = true;
      queryClient.clear();
      authApi
        .logout()
        .catch(() => undefined)
        .finally(() => window.location.replace('/login?sessao=expirada'));
    });
    return () => setUnauthorizedHandler(undefined);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

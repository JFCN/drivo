'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import type { LoginInput, RegisterInput, User } from './types';

export const ME_QUERY_KEY = ['me'] as const;

export const useCurrentUser = () =>
  useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
  });

const useStartSession = () => {
  const queryClient = useQueryClient();
  return (user: User) => {
    queryClient.clear();
    queryClient.setQueryData(ME_QUERY_KEY, user);
  };
};

export const useLogin = () => {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: startSession,
  });
};

export const useRegister = () => {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: startSession,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear();
      router.replace('/login');
      router.refresh();
    },
  });
};

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ME_QUERY_KEY } from '@/features/auth/hooks';
import { profileApi, type PasswordInput, type ProfileInput } from './api';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => profileApi.update(input),
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (image: Blob) => profileApi.uploadAvatar(image),
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.removeAvatar,
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (input: PasswordInput) => profileApi.changePassword(input),
  });

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: profileApi.remove,
    onSuccess: () => {
      queryClient.clear();
      router.replace('/cadastro');
      router.refresh();
    },
  });
};

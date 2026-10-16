import { apiRequest } from '@/lib/api-client';
import type { User } from '@/features/auth/types';

export type ProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
};

export type PasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const profileApi = {
  update: (input: ProfileInput) => apiRequest<User>('/users/me', { method: 'PATCH', body: input }),
  changePassword: (input: PasswordInput) => apiRequest<void>('/users/me/password', { method: 'PATCH', body: input }),
  remove: () => apiRequest<void>('/users/me', { method: 'DELETE' }),
  uploadAvatar: (image: Blob) => {
    const form = new FormData();
    form.append('file', image, 'avatar.jpg');
    return apiRequest<User>('/users/me/avatar', { method: 'PUT', body: form });
  },
  removeAvatar: () => apiRequest<User>('/users/me/avatar', { method: 'DELETE' }),
};

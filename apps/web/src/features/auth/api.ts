import { apiRequest } from '@/lib/api-client';
import type { LoginInput, RegisterInput, User } from './types';

export const authApi = {
  login: (input: LoginInput) => apiRequest<User>('/auth/login', { method: 'POST', body: input }),
  register: (input: RegisterInput) => apiRequest<User>('/auth/register', { method: 'POST', body: input }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  me: () => apiRequest<User>('/users/me'),
};

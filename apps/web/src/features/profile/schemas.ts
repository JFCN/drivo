import { z } from '@/lib/zod';
import { passwordRule } from '@/features/auth/schemas';

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Informe seu nome').max(60, 'Use no máximo 60 caracteres'),
  lastName: z.string().trim().max(80, 'Use no máximo 80 caracteres'),
  email: z.string().trim().min(1, 'Informe seu e-mail').email('Digite um e-mail válido'),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, 'Repita a nova senha'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'A nova senha deve ser diferente da atual',
  });

export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;

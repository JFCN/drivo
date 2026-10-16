import { z } from '@/lib/zod';
import { PASSWORD_PATTERN } from '@/lib/validation';

const email = z.string().trim().min(1, 'Informe seu e-mail').email('Digite um e-mail válido');

export const passwordRule = z
  .string()
  .min(8, 'Use ao menos 8 caracteres')
  .max(72, 'Use no máximo 72 caracteres')
  .regex(PASSWORD_PATTERN, 'Combine letras e números');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe seu nome completo')
      .refine((value) => value.split(/\s+/).length >= 2, 'Informe nome e sobrenome'),
    email,
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

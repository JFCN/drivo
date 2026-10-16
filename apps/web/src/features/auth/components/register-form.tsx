'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { ApiError, errorMessage } from '@/lib/api-client';
import { useRegister } from '../hooks';
import { registerSchema, type RegisterValues } from '../schemas';
import { AuthShell } from './auth-shell';

export const RegisterForm = () => {
  const router = useRouter();
  const registerAccount = useRegister();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(({ name, email, password }) => {
    registerAccount.mutate(
      { name, email, password },
      {
        onSuccess: () => router.replace('/veiculos'),
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setError('email', { message: error.message });
          }
        },
      },
    );
  });

  const generalError =
    registerAccount.isError && !(registerAccount.error instanceof ApiError && registerAccount.error.status === 409);

  return (
    <AuthShell
      title="Criar sua conta"
      description="Leva menos de um minuto. Depois é só adicionar seus veículos."
      footer={
        <>
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
            Entrar
          </Link>
        </>
      }
    >
      {generalError && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-field bg-danger/10 p-3 text-callout text-danger">
          <Icon name="error" className="mt-px size-5 shrink-0" />
          {errorMessage(registerAccount.error)}
        </div>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label="Nome completo"
          autoComplete="name"
          placeholder="Como você se chama?"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Senha"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordField
          label="Confirmar senha"
          autoComplete="new-password"
          placeholder="Repita a senha"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth loading={registerAccount.isPending} className="mt-6">
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
};

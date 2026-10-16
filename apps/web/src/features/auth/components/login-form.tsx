'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/api-client';
import { safeRedirect } from '@/lib/validation';
import { useLogin } from '../hooks';
import { loginSchema, type LoginValues } from '../schemas';
import { AuthShell } from './auth-shell';

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const sessionExpired = searchParams.get('sessao') === 'expirada';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => router.replace(safeRedirect(searchParams.get('next'))),
    });
  });

  return (
    <AuthShell
      title="Entrar no Drivo"
      description="Seus veículos, dados e documentos em um só lugar."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="font-medium text-accent hover:text-accent-hover">
            Criar conta
          </Link>
        </>
      }
    >
      {(sessionExpired || login.isError) && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-field bg-danger/10 p-3 text-callout text-danger">
          <Icon name="error" className="mt-px size-5 shrink-0" />
          {login.isError ? errorMessage(login.error) : 'Sua sessão expirou. Entre novamente.'}
        </div>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
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
          autoComplete="current-password"
          placeholder="Sua senha"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" fullWidth loading={login.isPending} className="mt-4">
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
};

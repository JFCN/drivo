'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { useToast } from '@/components/ui/toast';
import { ApiError, errorMessage } from '@/lib/api-client';
import { useChangePassword } from '../hooks';
import { passwordSchema, type PasswordValues } from '../schemas';
import { SettingsCard } from './settings-section';

const EMPTY: PasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

export const PasswordForm = () => {
  const toast = useToast();
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: EMPTY,
  });

  const onSubmit = handleSubmit(({ currentPassword, newPassword }) => {
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          reset(EMPTY);
          toast.success('Senha alterada com sucesso.');
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 400 && /atual/i.test(error.message)) {
            setError('currentPassword', { message: error.message });
            return;
          }
          toast.error(errorMessage(error));
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <SettingsCard
        footerText="Altere sua senha com segurança"
        footerAction={
          <Button type="submit" variant="secondary" size="md" loading={changePassword.isPending}>
            Alterar senha
          </Button>
        }
      >
        <PasswordField
          label="Senha atual"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <PasswordField
            label="Nova senha"
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordField
            label="Confirmar nova senha"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </SettingsCard>
    </form>
  );
};

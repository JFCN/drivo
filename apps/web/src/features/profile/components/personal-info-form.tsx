'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import type { User } from '@/features/auth/types';
import { ApiError, errorMessage } from '@/lib/api-client';
import { useUpdateProfile } from '../hooks';
import { profileSchema, type ProfileValues } from '../schemas';
import { SettingsCard } from './settings-section';

type PersonalInfoFormProps = {
  user: User;
};

export const PersonalInfoForm = ({ user }: PersonalInfoFormProps) => {
  const toast = useToast();
  const update = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user.firstName, lastName: user.lastName, email: user.email },
  });

  const onSubmit = handleSubmit((values) => {
    if (!isDirty) {
      toast.info('Nenhuma alteração para salvar.');
      return;
    }
    update.mutate(values, {
      onSuccess: (saved) => {
        reset({ firstName: saved.firstName, lastName: saved.lastName, email: saved.email });
        toast.success('Informações atualizadas.');
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 409) {
          setError('email', { message: error.message });
          return;
        }
        toast.error(errorMessage(error));
      },
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <SettingsCard
        footerText="Alterações salvas ficam visíveis na hora."
        footerAction={
          <Button type="submit" size="md" loading={update.isPending}>
            Salvar
          </Button>
        }
      >
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <TextField label="Nome" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Sobrenome" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <TextField label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      </SettingsCard>
    </form>
  );
};

'use client';

import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/features/auth/hooks';
import { errorMessage } from '@/lib/api-client';
import { formatMemberSince, fullName } from '@/lib/format';
import { AccountActions } from './account-actions';
import { AvatarEditor } from './avatar-editor';
import { PasswordForm } from './password-form';
import { PersonalInfoForm } from './personal-info-form';
import { SettingsSection } from './settings-section';

const ProfileSkeleton = () => (
  <div role="status" aria-label="Carregando perfil" className="flex flex-col gap-16">
    <div className="flex items-center gap-6">
      <Skeleton className="size-[5.5rem] rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
    </div>
    <Skeleton className="h-64 rounded-card" />
    <Skeleton className="h-64 rounded-card" />
  </div>
);

export const ProfileView = () => {
  const { data: user, isPending, isError, error, refetch, isFetching } = useCurrentUser();

  return (
    <div className="mx-auto w-full max-w-[60rem] px-4 pt-10 pb-20 sm:px-8 sm:pt-12">
      {isPending ? (
        <ProfileSkeleton />
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <div className="flex flex-col gap-14 md:gap-16">
          <header className="flex items-start gap-5 sm:gap-6">
            <AvatarEditor user={user} />
            <div className="min-w-0 pt-2 sm:pt-3">
              <h1 className="truncate text-title-1 sm:text-[2.25rem]">{fullName(user.firstName, user.lastName)}</h1>
              <p className="mt-1 text-headline font-normal text-text-secondary">
                <span className="break-all">{user.email}</span>
                <span className="max-sm:hidden"> · </span>
                <span className="block sm:inline">{formatMemberSince(user.createdAt)}</span>
              </p>
            </div>
          </header>

          <SettingsSection
            title="Informações pessoais"
            description="Seu nome aparece no app. O e-mail é usado para entrar e receber avisos."
          >
            <PersonalInfoForm key={user.id} user={user} />
          </SettingsSection>

          <SettingsSection
            title="Senha"
            description="Use ao menos 8 caracteres, combinando letras e números. Você continuará conectado neste dispositivo."
          >
            <PasswordForm />
          </SettingsSection>

          <SettingsSection title="Conta" description="Encerre a sessão ou exclua sua conta e todos os veículos cadastrados.">
            <AccountActions />
          </SettingsSection>
        </div>
      )}
    </div>
  );
};

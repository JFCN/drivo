'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { useLogout } from '@/features/auth/hooks';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { useDeleteAccount } from '../hooks';

type ActionRowProps = {
  title: string;
  description: string;
  actionLabel: string;
  tone: 'accent' | 'danger';
  loading?: boolean;
  onAction: () => void;
};

const ActionRow = ({ title, description, actionLabel, tone, loading, onAction }: ActionRowProps) => (
  <div className="flex items-center justify-between gap-4 px-6 py-4">
    <div>
      <p className="text-headline font-medium">{title}</p>
      <p className="text-body text-text-secondary">{description}</p>
    </div>
    <button
      type="button"
      onClick={onAction}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-2 py-1 text-headline font-normal transition-colors disabled:opacity-50',
        tone === 'accent' ? 'text-accent hover:text-accent-hover' : 'text-danger hover:text-danger-hover',
      )}
    >
      {loading && <Spinner className="size-4" />}
      {actionLabel}
    </button>
  </div>
);

export const AccountActions = () => {
  const toast = useToast();
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="divide-y divide-separator/60 overflow-hidden rounded-card bg-surface">
      <ActionRow
        title="Sair da conta"
        description="Encerra a sessão neste dispositivo"
        actionLabel="Sair"
        tone="accent"
        loading={logout.isPending}
        onAction={() => logout.mutate()}
      />
      <ActionRow
        title="Excluir conta"
        description="Apaga sua conta e todos os veículos"
        actionLabel="Excluir"
        tone="danger"
        onAction={() => setConfirmOpen(true)}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir sua conta?"
        description="Sua conta e todos os veículos cadastrados serão apagados permanentemente."
        confirmLabel="Excluir conta"
        loading={deleteAccount.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          deleteAccount.mutate(undefined, {
            onError: (error) => {
              setConfirmOpen(false);
              toast.error(errorMessage(error));
            },
          })
        }
      />
    </div>
  );
};

'use client';

import { useRef } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import type { User } from '@/features/auth/types';
import { errorMessage } from '@/lib/api-client';
import { initials } from '@/lib/format';
import { toSquareJpeg, validateAvatarSource } from '@/lib/image';
import { useRemoveAvatar, useUploadAvatar } from '../hooks';

type AvatarEditorProps = {
  user: User;
};

export const AvatarEditor = ({ user }: AvatarEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const busy = upload.isPending || remove.isPending;

  const onSelect = async (file: File) => {
    const invalid = validateAvatarSource(file);
    if (invalid) {
      toast.error(invalid);
      return;
    }

    try {
      const image = await toSquareJpeg(file);
      upload.mutate(image, {
        onSuccess: () => toast.success('Foto de perfil atualizada.'),
        onError: (error) => toast.error(errorMessage(error)),
      });
    } catch {
      toast.error('Não foi possível ler essa imagem. Tente outra.');
    }
  };

  const onRemove = () =>
    remove.mutate(undefined, {
      onSuccess: () => toast.success('Foto de perfil removida.'),
      onError: (error) => toast.error(errorMessage(error)),
    });

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) {
            onSelect(file);
          }
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={user.avatarUrl ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'}
        className="group relative rounded-full disabled:cursor-wait"
      >
        <Avatar size="lg" src={user.avatarUrl} initials={initials(user.firstName, user.lastName)} />
        <span className="absolute inset-0 grid place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy ? <Spinner className="size-6" label="Enviando foto" /> : <Icon name="camera" className="size-7" />}
        </span>
        <span className="absolute right-0 bottom-0 grid size-7 place-items-center rounded-full bg-accent text-white ring-4 ring-bg sm:size-8">
          <Icon name="camera" className="size-4" />
        </span>
      </button>
      {user.avatarUrl && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          className="text-footnote text-text-secondary transition-colors hover:text-danger disabled:opacity-50"
        >
          Remover foto
        </button>
      )}
    </div>
  );
};

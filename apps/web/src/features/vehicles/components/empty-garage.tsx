'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { setPendingCrlv } from '../pending-crlv';
import { CrlvFilePicker } from './crlv-file-picker';

export const EmptyGarage = () => {
  const router = useRouter();

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 pb-[4.5rem] text-center">
      <h1 className="text-title-1">Sua garagem está vazia</h1>
      <p className="mt-3 max-w-[38rem] text-headline font-normal text-text-secondary">
        Adicione seu primeiro veículo. Com o CRLV em mãos, a maior parte dos dados é preenchida automaticamente.
      </p>
      <CrlvFilePicker
        onSelect={(file) => {
          setPendingCrlv(file);
          router.push('/veiculos/novo');
        }}
      >
        {(open) => (
          <Button onClick={open} size="xl" className="mt-9">
            Importar CRLV
          </Button>
        )}
      </CrlvFilePicker>
      <Link href="/veiculos/novo" className="mt-5 text-callout text-text-secondary hover:text-text-primary">
        ou preencher manualmente
      </Link>
    </section>
  );
};

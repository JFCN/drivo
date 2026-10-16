import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { buttonClasses } from '@/components/ui/button';

const NotFound = () => {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="w-24 text-text-tertiary" />
      <h1 className="mt-6 text-title-1">Página não encontrada</h1>
      <p className="mt-2 text-body text-text-secondary">O endereço que você tentou acessar não existe.</p>
      <Link href="/veiculos" className={buttonClasses({ className: 'mt-8' })}>
        Ir para Meus veículos
      </Link>
    </main>
  );
};

export default NotFound;

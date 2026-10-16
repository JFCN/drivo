import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,48%)_minmax(0,1fr)]">
      <aside className="hidden p-4 lg:block">
        <div className="relative h-full min-h-[40rem] overflow-hidden rounded-[1.75rem] bg-hero">
          <div className="absolute inset-x-0 top-0">
            <img src="/images/auth-hero.webp" alt="Sedã escuro estacionado em uma garagem de concreto" className="w-full" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-hero" />
          </div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent from-55% to-black/50" />
          <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
            <p className="text-[2.75rem] leading-[1.05] font-bold tracking-[-0.035em] text-white">
              Sua garagem,
              <br />
              sempre à mão.
            </p>
            <p className="mt-5 max-w-md text-headline font-normal text-text-secondary">
              Placa, Renavam e licenciamento de todos os seus veículos em um só lugar.
            </p>
          </div>
        </div>
      </aside>
      <main className="flex min-h-dvh flex-col items-center px-6 py-10">{children}</main>
    </div>
  );
};

export default AuthLayout;

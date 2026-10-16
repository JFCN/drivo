import type { ReactNode } from 'react';
import { LogoMark } from '@/components/brand/logo';

type AuthShellProps = {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export const AuthShell = ({ title, description, footer, children }: AuthShellProps) => {
  return (
    <>
      <div className="flex w-full max-w-[22.5rem] flex-1 flex-col justify-center">
        <LogoMark className="mx-auto w-[5.5rem] text-white" title="Drivo" />
        <h1 className="mt-10 text-center text-title-1">{title}</h1>
        <p className="mt-3 text-center text-headline font-normal text-text-secondary">{description}</p>
        <div className="mt-9">{children}</div>
      </div>
      <p className="mt-10 text-center text-headline font-normal text-text-secondary">{footer}</p>
    </>
  );
};

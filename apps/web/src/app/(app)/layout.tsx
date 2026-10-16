import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/app-header';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
};

export default AppLayout;

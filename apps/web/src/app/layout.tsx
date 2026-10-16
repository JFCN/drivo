import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Drivo',
    template: '%s · Drivo',
  },
  description: 'Monte sua garagem e importe o CRLV com preenchimento automático.',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = async ({ children }: RootLayoutProps) => {
  await connection();

  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;

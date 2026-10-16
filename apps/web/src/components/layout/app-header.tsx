'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/logo';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/features/auth/hooks';
import { cn } from '@/lib/cn';
import { fullName, initials } from '@/lib/format';

const NAV_ITEMS = [
  { href: '/veiculos', label: 'Meus veículos' },
  { href: '/perfil', label: 'Perfil' },
];

export const AppHeader = () => {
  const pathname = usePathname();
  const { data: user, isPending } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md">
      <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:h-[4.5rem] sm:grid-cols-[1fr_auto_1fr] sm:px-10">
        <Link href="/veiculos" aria-label="Drivo, ir para Meus veículos" className="justify-self-start">
          <Logo hideWordmarkOnMobile />
        </Link>

        <nav aria-label="Principal" className="justify-self-center">
          <ul className="flex rounded-xl bg-surface p-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-8 items-center rounded-[0.5625rem] px-3 text-callout font-normal transition-colors sm:px-5 sm:text-body',
                      active ? 'bg-surface-3 text-text-primary' : 'text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link href="/perfil" className="flex items-center gap-4 justify-self-end" aria-label="Abrir perfil">
          {isPending || !user ? (
            <>
              <Skeleton className="hidden h-4 w-28 md:block" />
              <Skeleton className="size-9 rounded-full" />
            </>
          ) : (
            <>
              <span className="hidden text-body text-text-secondary md:block">{fullName(user.firstName, user.lastName)}</span>
              <Avatar src={user.avatarUrl} initials={initials(user.firstName, user.lastName)} />
            </>
          )}
        </Link>
      </div>
    </header>
  );
};

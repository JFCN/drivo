'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { errorMessage } from '@/lib/api-client';
import { pluralize } from '@/lib/format';
import { useVehicles } from '../hooks';
import { countPages, pageWindow, parsePage } from '../pagination';
import { AddVehicleCard } from './add-vehicle-card';
import { EmptyGarage } from './empty-garage';
import { VehicleCard } from './vehicle-card';
import { VehicleGridSkeleton } from './vehicle-grid-skeleton';

const PAGE_PARAM = 'pagina';

export const VehiclesView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get(PAGE_PARAM));

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const searching = debouncedSearch !== '';
  const withAddCard = !searching;

  const vehicles = useVehicles({ search: debouncedSearch, ...pageWindow(page, withAddCard) });
  const total = vehicles.data?.total ?? 0;
  const totalPages = countPages(total, withAddCard);

  const goToPage = (target: number) => {
    const params = new URLSearchParams(searchParams);
    if (target <= 1) {
      params.delete(PAGE_PARAM);
    } else {
      params.set(PAGE_PARAM, String(target));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    if (page !== 1) {
      router.replace(pathname, { scroll: false });
    }
  };

  useEffect(() => {
    if (vehicles.data && !vehicles.isPlaceholderData && total > 0 && page > totalPages) {
      router.replace(totalPages > 1 ? `${pathname}?${PAGE_PARAM}=${totalPages}` : pathname, { scroll: false });
    }
  }, [vehicles.data, vehicles.isPlaceholderData, total, page, totalPages, pathname, router]);

  if (vehicles.isPending) {
    return (
      <div className="mx-auto w-full max-w-[80rem] px-4 pt-8 pb-16 sm:px-8 sm:pt-12">
        <Skeleton className="h-11 w-72" />
        <Skeleton className="mt-3 mb-12 h-5 w-44" />
        <VehicleGridSkeleton />
      </div>
    );
  }

  if (vehicles.isError) {
    return (
      <ErrorState
        message={errorMessage(vehicles.error)}
        onRetry={() => vehicles.refetch()}
        retrying={vehicles.isFetching}
      />
    );
  }

  const list = vehicles.data.data;

  if (!searching && search === '' && total === 0) {
    return <EmptyGarage />;
  }

  const subtitle = searching
    ? `${pluralize(total, 'resultado', 'resultados')} para “${debouncedSearch}”`
    : `${pluralize(total, 'veículo cadastrado', 'veículos cadastrados')}`;

  return (
    <div className="mx-auto w-full max-w-[80rem] px-4 pt-8 pb-16 sm:px-8 sm:pt-12">
      <div className="mb-10 flex flex-col gap-6 sm:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-large-title">Meus veículos</h1>
            <Link
              href="/veiculos/novo"
              aria-label="Adicionar veículo"
              className="grid size-11 place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover active:bg-accent-pressed"
            >
              <Icon name="add" className="size-6" />
            </Link>
          </div>
          <p className="mt-2 text-headline font-normal text-text-secondary" aria-live="polite">
            {subtitle}
          </p>
        </div>

        <div className="relative w-full md:max-w-[23.5rem]">
          <label htmlFor="vehicle-search" className="sr-only">
            Buscar por placa ou modelo
          </label>
          <input
            id="vehicle-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por placa ou modelo"
            autoComplete="off"
            className="h-12 w-full rounded-xl bg-surface pr-11 pl-4 text-body text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-accent focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text-tertiary">
            {vehicles.isFetching ? <Spinner className="size-4" label="Buscando" /> : <Icon name="search" className="size-5" />}
          </span>
        </div>
      </div>

      {searching && list.length === 0 ? (
        <div className="flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center">
          <Icon name="search" className="size-10 text-text-tertiary" />
          <h2 className="mt-4 text-title-3">Nenhum veículo encontrado</h2>
          <p className="mt-1 text-body text-text-secondary">Tente buscar por outra placa, marca ou modelo.</p>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="mt-5 text-callout text-accent hover:text-accent-hover"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <ul className="grid auto-rows-fr grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {withAddCard && page === 1 && (
            <li className="min-w-0">
              <AddVehicleCard />
            </li>
          )}
          {list.map((vehicle) => (
            <li key={vehicle.id} className="min-w-0">
              <VehicleCard vehicle={vehicle} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} onChange={goToPage} />
    </div>
  );
};

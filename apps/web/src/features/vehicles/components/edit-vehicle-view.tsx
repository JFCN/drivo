'use client';

import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, errorMessage } from '@/lib/api-client';
import { useVehicle } from '../hooks';
import { VehicleEditor } from './vehicle-editor';

const EditorSkeleton = () => (
  <div role="status" aria-label="Carregando veículo" className="mx-auto w-full max-w-[80rem] px-4 pt-8 sm:px-8 sm:pt-12">
    <Skeleton className="h-4 w-14" />
    <Skeleton className="mt-3 h-12 w-72" />
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23.75rem]">
      <div className="flex flex-col gap-8">
        <Skeleton className="h-80 rounded-card" />
        <Skeleton className="h-96 rounded-card" />
      </div>
      <Skeleton className="h-64 rounded-card" />
    </div>
  </div>
);

type EditVehicleViewProps = {
  id: string;
};

export const EditVehicleView = ({ id }: EditVehicleViewProps) => {
  const vehicle = useVehicle(id);

  if (vehicle.isPending) {
    return <EditorSkeleton />;
  }

  if (vehicle.isError) {
    const notFound = vehicle.error instanceof ApiError && [400, 404].includes(vehicle.error.status);
    return notFound ? (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <h1 className="text-title-1">Veículo não encontrado</h1>
        <p className="mt-2 text-body text-text-secondary">Ele pode ter sido excluído ou não pertence à sua garagem.</p>
        <Link href="/veiculos" className={buttonClasses({ className: 'mt-8' })}>
          Voltar para Meus veículos
        </Link>
      </div>
    ) : (
      <ErrorState message={errorMessage(vehicle.error)} onRetry={() => vehicle.refetch()} retrying={vehicle.isFetching} />
    );
  }

  return <VehicleEditor key={vehicle.data.updatedAt} vehicle={vehicle.data} />;
};

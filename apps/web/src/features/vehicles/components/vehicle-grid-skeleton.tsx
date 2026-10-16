import { Skeleton } from '@/components/ui/skeleton';

export const VehicleGridSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div role="status" aria-label="Carregando veículos" className="grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-card bg-surface">
          <Skeleton className="aspect-[1.91] rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-6 pt-6">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

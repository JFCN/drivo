import Link from 'next/link';
import { PlateBadge } from '@/components/brand/plate-badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';
import { maskChassis } from '@/lib/format';
import { colorDotClass, vehicleSummary } from '../labels';
import type { Vehicle } from '../types';
import { VehicleCover } from './vehicle-cover';

type VehicleCardProps = {
  vehicle: Vehicle;
};

export const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  return (
    <Link
      href={`/veiculos/${vehicle.id}`}
      aria-label={`Editar ${vehicle.brand} ${vehicle.model}, placa ${vehicle.plate}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-card bg-surface transition-colors hover:bg-[#232325]"
    >
      <div className="relative aspect-[1.91] shrink-0 overflow-hidden">
        <VehicleCover
          vehicle={vehicle}
          className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {vehicle.photoUrl && (
          <span className="absolute right-3 bottom-2 text-[0.625rem] text-white/60">Foto: Wikimedia Commons</span>
        )}
        {vehicle.nickname && (
          <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-footnote font-medium text-white backdrop-blur">
            {vehicle.nickname}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-caption tracking-[0.12em] text-text-tertiary uppercase">{vehicle.brand}</p>
            <h3 className="mt-1.5 truncate text-[1.375rem] leading-tight font-semibold tracking-[-0.02em]">{vehicle.model}</h3>
            <p className="mt-2.5 flex items-center gap-2 text-body text-text-secondary">
              <span aria-hidden className={cn('size-2.5 shrink-0 rounded-full', colorDotClass(vehicle.color))} />
              <span className="truncate">{vehicleSummary(vehicle)}</span>
            </p>
          </div>
          <PlateBadge plate={vehicle.plate} className="mt-4" />
        </div>

        <div className="mt-8 flex items-end gap-6">
          <dl className="grid flex-1 grid-cols-2 gap-6">
            <div>
              <dt className="text-caption tracking-[0.12em] text-text-tertiary uppercase">Renavam</dt>
              <dd className="mt-1 font-mono text-callout text-text-primary">{vehicle.renavam}</dd>
            </div>
            <div>
              <dt className="text-caption tracking-[0.12em] text-text-tertiary uppercase">Chassi</dt>
              <dd className="mt-1 font-mono text-callout text-text-primary" aria-label={`Chassi final ${vehicle.chassis.slice(-4)}`}>
                {maskChassis(vehicle.chassis)}
              </dd>
            </div>
          </dl>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-text-primary transition-colors group-hover:bg-surface-3"
          >
            <Icon name="arrowForward" className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

'use client';

import { useState } from 'react';
import { LogoMark } from '@/components/brand/logo';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/cn';
import type { Vehicle, VehicleType } from '../types';

const ICON_BY_TYPE: Partial<Record<VehicleType, IconName>> = {
  MOTORCYCLE: 'motorcycle',
  TRUCK: 'truck',
  VAN: 'van',
};

type GenericCoverProps = {
  type: VehicleType;
  className?: string;
};

const GenericCover = ({ type, className }: GenericCoverProps) => {
  const icon = ICON_BY_TYPE[type];

  return (
    <div
      role="img"
      aria-label="Imagem genérica de veículo"
      className={cn('grid place-items-center bg-gradient-to-b from-surface-3 via-surface-2 to-surface', className)}
    >
      {icon ? (
        <Icon name={icon} className="size-20 text-surface-4" />
      ) : (
        <LogoMark className="w-1/2 max-w-56 text-surface-4" />
      )}
    </div>
  );
};

type VehicleCoverProps = {
  vehicle: Pick<Vehicle, 'type' | 'brand' | 'model' | 'photoUrl'>;
  className?: string;
};

export const VehicleCover = ({ vehicle, className }: VehicleCoverProps) => {
  const [failed, setFailed] = useState(false);

  if (!vehicle.photoUrl || failed) {
    return <GenericCover type={vehicle.type} className={className} />;
  }

  return (
    <img
      src={vehicle.photoUrl}
      alt={`${vehicle.brand} ${vehicle.model}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('bg-surface-2 object-cover', className)}
    />
  );
};

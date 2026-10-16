'use client';

import { useEffect, useState } from 'react';
import { clearPendingCrlv, readPendingCrlv } from '../pending-crlv';
import { VehicleEditor } from './vehicle-editor';

export const NewVehicleView = () => {
  const [initialCrlv] = useState(readPendingCrlv);

  useEffect(() => {
    clearPendingCrlv();
  }, []);

  return <VehicleEditor initialCrlv={initialCrlv} />;
};

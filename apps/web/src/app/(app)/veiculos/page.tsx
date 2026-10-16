import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VehiclesView } from '@/features/vehicles/components/vehicles-view';

export const metadata: Metadata = {
  title: 'Meus veículos',
};

const VehiclesPage = () => {
  return (
    <Suspense>
      <VehiclesView />
    </Suspense>
  );
};

export default VehiclesPage;

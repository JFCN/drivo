import type { Metadata } from 'next';
import { NewVehicleView } from '@/features/vehicles/components/new-vehicle-view';

export const metadata: Metadata = {
  title: 'Novo veículo',
};

const NewVehiclePage = () => {
  return <NewVehicleView />;
};

export default NewVehiclePage;

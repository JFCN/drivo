import type { Metadata } from 'next';
import { EditVehicleView } from '@/features/vehicles/components/edit-vehicle-view';

export const metadata: Metadata = {
  title: 'Editar veículo',
};

type EditVehiclePageProps = {
  params: Promise<{ id: string }>;
};

const EditVehiclePage = async ({ params }: EditVehiclePageProps) => {
  const { id } = await params;
  return <EditVehicleView id={id} />;
};

export default EditVehiclePage;

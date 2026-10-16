import Link from 'next/link';
import { Icon } from '@/components/ui/icon';

export const AddVehicleCard = () => {
  return (
    <Link
      href="/veiculos/novo"
      className="group flex h-full min-h-[22rem] w-full flex-col items-center justify-center rounded-card border-2 border-dashed border-surface-3 px-6 text-center transition-colors hover:border-surface-4 hover:bg-surface/40"
    >
      <span className="grid size-14 place-items-center rounded-full bg-surface-2 transition-colors group-hover:bg-surface-3">
        <Icon name="add" className="size-7" />
      </span>
      <span className="mt-4 text-title-3">Adicionar veículo</span>
      <span className="mt-2 text-body text-text-secondary">Preencha manualmente ou importe o CRLV</span>
    </Link>
  );
};

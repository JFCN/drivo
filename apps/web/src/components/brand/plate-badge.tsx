import { cn } from '@/lib/cn';

type PlateBadgeProps = {
  plate: string;
  className?: string;
};

export const PlateBadge = ({ plate, className }: PlateBadgeProps) => {
  return (
    <span
      aria-label={`Placa ${plate}`}
      className={cn('inline-flex w-[6.5rem] shrink-0 flex-col overflow-hidden rounded-md bg-white ring-1 ring-black/10', className)}
    >
      <span aria-hidden className="flex h-2.5 items-center justify-between bg-plate-blue px-1.5">
        <span className="text-[0.4375rem] leading-none font-bold tracking-wider text-white">BRASIL</span>
        <span className="h-1 w-2 rounded-[1px] bg-plate-green" />
      </span>
      <span aria-hidden className="py-1 text-center font-mono text-[0.9375rem] leading-tight font-semibold tracking-[0.16em] text-black">
        {plate}
      </span>
    </span>
  );
};

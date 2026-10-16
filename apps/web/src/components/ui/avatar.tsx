import { cn } from '@/lib/cn';

type AvatarProps = {
  initials: string;
  src?: string | null;
  size?: 'sm' | 'lg';
  className?: string;
};

const SIZES = {
  sm: 'size-9 text-footnote',
  lg: 'size-20 text-[1.75rem] sm:size-[5.5rem] sm:text-[2rem]',
};

export const Avatar = ({ initials, src, size = 'sm', className }: AvatarProps) => {
  if (src) {
    return <img src={src} alt="" className={cn('shrink-0 rounded-full bg-surface-2 object-cover', SIZES[size], className)} />;
  }

  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full bg-avatar font-semibold text-white', SIZES[size], className)}
    >
      {initials}
    </span>
  );
};

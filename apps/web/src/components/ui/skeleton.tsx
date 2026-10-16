import { cn } from '@/lib/cn';

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className }: SkeletonProps) => {
  return <div aria-hidden className={cn('animate-pulse rounded-lg bg-surface-2', className)} />;
};

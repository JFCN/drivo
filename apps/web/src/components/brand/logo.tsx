import { useId } from 'react';
import { cn } from '@/lib/cn';

type LogoMarkProps = {
  className?: string;
  title?: string;
};

export const LogoMark = ({ className, title }: LogoMarkProps) => {
  const maskId = useId();

  return (
    <svg
      viewBox="0 0 183 64"
      className={cn('h-auto', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <defs>
        <mask id={maskId}>
          <path
            fill="#fff"
            d="M8 18.5C5.5 22 4.2 26 4.3 30.5C4.4 37 5 43.5 7 47C9 50 12 51.4 16 52L166 52C171 51.5 175.2 49.5 176.6 46C178 42 179.2 36.5 179 32.5C178.6 29 176.5 26.5 172.5 24.8C166 22.2 156 20.6 140 19.8L118 19C111.5 14 103 8.4 96 6C90 4.2 80 4.2 70 4.8C60 5.4 52 7.8 45 11C36 13.2 22 15.4 13 16.8C10.6 17.2 9 17.6 8 18.5Z"
          />
          <path
            fill="#000"
            d="M49.5 18.5C50 15.5 53 13.2 58 12.2C66 10.6 80 9.4 92 9.6C99 9.8 105 12.4 111.5 17.6C112.2 18.3 112 19.4 111 19.4L51.5 19.8C50 19.8 49.3 19.4 49.5 18.5Z"
          />
          <circle cx="37.5" cy="42.5" r="15.6" fill="#000" />
          <circle cx="148.5" cy="42.5" r="15.6" fill="#000" />
        </mask>
      </defs>
      <rect width="183" height="64" fill="currentColor" mask={`url(#${maskId})`} />
      <circle cx="37.5" cy="42.5" r="15" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="148.5" cy="42.5" r="15" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
};

type LogoProps = {
  className?: string;
  hideWordmarkOnMobile?: boolean;
};

export const Logo = ({ className, hideWordmarkOnMobile }: LogoProps) => {
  return (
    <span className={cn('inline-flex items-center gap-4', className)}>
      <LogoMark className="w-14 text-white sm:w-[3.75rem]" />
      <span className={cn('text-title-3 text-text-primary', hideWordmarkOnMobile && 'max-sm:sr-only')}>Drivo</span>
    </span>
  );
};

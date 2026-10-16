import type { ButtonHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
export type ButtonSize = 'md' | 'lg' | 'xl';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover active:bg-accent-pressed disabled:bg-accent/30 disabled:text-white/40',
  secondary:
    'bg-surface-2 text-text-primary hover:bg-surface-3 active:bg-surface-4 disabled:bg-surface disabled:text-text-tertiary',
  destructive:
    'bg-danger text-white hover:bg-danger-hover active:bg-danger-pressed disabled:bg-danger/30 disabled:text-white/40',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'h-9 rounded-field px-4 text-callout font-semibold',
  lg: 'h-11 rounded-xl px-6 text-body font-semibold',
  xl: 'h-[3.75rem] rounded-2xl px-7 text-headline',
};

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export const buttonClasses = ({ variant = 'primary', size = 'lg', fullWidth, className }: ButtonStyleOptions = {}): string =>
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors select-none disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    loading?: boolean;
    ref?: Ref<HTMLButtonElement>;
  };

export const Button = ({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Spinner className="size-4" label="Processando" />}
      {children}
    </button>
  );
};

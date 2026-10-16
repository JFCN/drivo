import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '@/lib/cn';

export const fieldControlClasses = (hasError: boolean, hasAdornment: boolean): string =>
  cn(
    'h-11 w-full rounded-field bg-surface-2 px-4 text-body text-text-primary transition-shadow',
    'placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent',
    'disabled:cursor-not-allowed disabled:bg-surface-2/50 disabled:text-text-tertiary',
    hasError && 'ring-1 ring-danger focus:ring-danger',
    hasAdornment && 'pr-11',
  );

type FieldShellProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

export const FieldShell = ({ id, label, error, hint, disabled, className, children }: FieldShellProps) => {
  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className={cn('mb-2 text-callout text-text-secondary', disabled && 'text-text-tertiary')}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-footnote text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-footnote text-text-tertiary">
            {hint}
          </p>
        )
      )}
    </div>
  );
};

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  endAdornment?: ReactNode;
  containerClassName?: string;
  ref?: Ref<HTMLInputElement>;
};

export const TextField = ({
  label,
  error,
  hint,
  endAdornment,
  containerClassName,
  className,
  id,
  disabled,
  ...props
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} disabled={disabled} className={containerClassName}>
      <div className="relative">
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(fieldControlClasses(Boolean(error), Boolean(endAdornment)), className)}
          {...props}
        />
        {endAdornment && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>}
      </div>
    </FieldShell>
  );
};

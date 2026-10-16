import { useId, type Ref, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './icon';
import { FieldShell, fieldControlClasses } from './text-field';

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  containerClassName?: string;
  ref?: Ref<HTMLSelectElement>;
};

export const SelectField = ({
  label,
  options,
  placeholder = 'Selecione',
  error,
  containerClassName,
  className,
  id,
  disabled,
  ...props
}: SelectFieldProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldShell id={selectId} label={label} error={error} disabled={disabled} className={containerClassName}>
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(fieldControlClasses(Boolean(error), true), 'appearance-none invalid:text-text-tertiary', className)}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary">
          <Icon name="arrowDown" className="size-5" />
        </div>
      </div>
    </FieldShell>
  );
};

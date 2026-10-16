'use client';

import { useState, type ComponentProps } from 'react';
import { Icon } from './icon';
import { TextField } from './text-field';

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'endAdornment'>;

export const PasswordField = (props: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="grid size-8 place-items-center rounded-lg text-text-tertiary transition-colors hover:text-text-secondary"
        >
          <Icon name={visible ? 'visibilityOff' : 'visibility'} className="size-5" />
        </button>
      }
    />
  );
};

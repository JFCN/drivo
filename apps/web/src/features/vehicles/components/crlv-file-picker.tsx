'use client';

import { useRef, type ReactNode } from 'react';
import { CRLV_ACCEPT } from '../crlv-file';

type CrlvFilePickerProps = {
  onSelect: (file: File) => void;
  children: (open: () => void) => ReactNode;
};

export const CrlvFilePicker = ({ onSelect, children }: CrlvFilePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={CRLV_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) {
            onSelect(file);
          }
        }}
      />
      {children(() => inputRef.current?.click())}
    </>
  );
};

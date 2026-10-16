'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './icon';

type ToastTone = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const DURATION = 4500;

const TONE_ICON = {
  success: { name: 'checkCircle', className: 'text-success' },
  error: { name: 'error', className: 'text-danger' },
  info: { name: 'wandStars', className: 'text-accent' },
} as const;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      nextId.current += 1;
      const id = nextId.current;
      setItems((current) => [...current.slice(-2), { id, tone, message }]);
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-50 flex flex-col items-center gap-2 px-4 sm:top-[5.25rem]"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-surface-3 py-3 pr-3 pl-4 text-callout text-text-primary"
          >
            <Icon name={TONE_ICON[item.tone].name} className={cn('size-5 shrink-0', TONE_ICON[item.tone].className)} />
            <span className="flex-1">{item.message}</span>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Fechar aviso"
              className="grid size-7 shrink-0 place-items-center rounded-full text-text-secondary hover:bg-surface-4"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
};

export const useToast = (): ToastApi => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

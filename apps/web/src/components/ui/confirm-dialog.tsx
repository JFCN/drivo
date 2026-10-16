'use client';

import { useEffect, useId, useRef } from 'react';
import { Button } from './button';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const ConfirmDialog = ({ open, title, description, confirmLabel, loading, onConfirm, onClose }: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      onCancel={(event) => {
        if (loading) {
          event.preventDefault();
        }
      }}
      className="m-auto w-[min(92vw,26rem)] rounded-card bg-surface p-6 text-text-primary backdrop:bg-black/70"
    >
      <h2 id={titleId} className="text-title-3">
        {title}
      </h2>
      <p id={descriptionId} className="mt-2 text-body text-text-secondary">
        {description}
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="destructive" size="md" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
};

'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatFileSize } from '@/lib/format';
import { validateCrlvFile } from '../crlv-file';
import { useExtractCrlv } from '../hooks';
import type { CrlvExtraction } from '../types';
import { CrlvFilePicker } from './crlv-file-picker';

type PanelState =
  | { status: 'idle' }
  | { status: 'reading'; file: File }
  | { status: 'done'; file: File }
  | { status: 'error'; file: File; message: string };

type CrlvImportPanelProps = {
  initialFile?: File | null;
  onExtracted: (extraction: CrlvExtraction) => void;
};

const fileIcon = (file: File) => (file.type === 'application/pdf' ? 'draft' : 'image');

export const CrlvImportPanel = ({ initialFile, onExtracted }: CrlvImportPanelProps) => {
  const [state, setState] = useState<PanelState>({ status: 'idle' });
  const [dragging, setDragging] = useState(false);
  const extract = useExtractCrlv();
  const startedInitial = useRef(false);

  const handleFile = (file: File) => {
    const invalid = validateCrlvFile(file);
    if (invalid) {
      setState({ status: 'error', file, message: invalid });
      return;
    }

    setState({ status: 'reading', file });
    extract.mutate(file, {
      onSuccess: (extraction) => {
        setState({ status: 'done', file });
        onExtracted(extraction);
      },
      onError: (error) => setState({ status: 'error', file, message: errorMessage(error) }),
    });
  };

  useEffect(() => {
    if (initialFile && !startedInitial.current) {
      startedInitial.current = true;
      handleFile(initialFile);
    }
  });

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && state.status !== 'reading') {
      handleFile(file);
    }
  };

  return (
    <section
      aria-labelledby="crlv-panel-title"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'rounded-card bg-surface p-6 transition-shadow',
        dragging && 'ring-2 ring-accent ring-offset-4 ring-offset-bg',
      )}
    >
      <div className="flex items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
          <Icon name="documentScanner" className="size-6" />
        </span>
        <div>
          <h2 id="crlv-panel-title" className="text-title-3">
            Importar CRLV
          </h2>
          <p className="text-body text-text-secondary">Preenchemos o formulário para você</p>
        </div>
      </div>

      <div aria-live="polite" className="mt-6 flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3.5">
        {state.status === 'idle' ? (
          <>
            <Icon name="draft" className="size-6 shrink-0 text-text-secondary" />
            <div className="min-w-0 flex-1">
              <p className="text-callout text-text-secondary">Nenhum arquivo selecionado</p>
              <p className="text-footnote text-text-tertiary">PDF, JPG ou PNG · até 10 MB</p>
            </div>
          </>
        ) : (
          <>
            <Icon name={state.status === 'error' ? 'error' : fileIcon(state.file)} className="size-6 shrink-0 text-danger" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-callout text-text-primary" title={state.file.name}>
                {state.file.name}
              </p>
              <p className={cn('text-footnote', state.status === 'error' ? 'text-danger' : 'text-text-tertiary')}>
                {state.status === 'reading' && `${formatFileSize(state.file.size)} · lendo com IA…`}
                {state.status === 'done' && `${formatFileSize(state.file.size)} · lido agora`}
                {state.status === 'error' && state.message}
              </p>
            </div>
            {state.status === 'reading' && <Spinner className="size-6 text-accent" label="Lendo documento" />}
            {state.status === 'done' && <Icon name="checkCircle" className="size-6 shrink-0 text-success" title="Leitura concluída" />}
          </>
        )}
      </div>

      <CrlvFilePicker onSelect={handleFile}>
        {(open) => (
          <Button variant="secondary" fullWidth className="mt-6" onClick={open} disabled={state.status === 'reading'}>
            {state.status === 'idle' && 'Escolher arquivo'}
            {state.status === 'reading' && 'Lendo documento…'}
            {state.status === 'done' && 'Importar outro CRLV'}
            {state.status === 'error' && 'Escolher outro arquivo'}
          </Button>
        )}
      </CrlvFilePicker>
    </section>
  );
};

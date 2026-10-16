'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button, buttonClasses } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Icon } from '@/components/ui/icon';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { ApiError, errorMessage } from '@/lib/api-client';
import { useDeleteVehicle, useSaveVehicle } from '../hooks';
import { FUEL_LABELS, TYPE_LABELS } from '../labels';
import {
  EMPTY_VEHICLE_FORM,
  extractionToFormValues,
  formValuesToInput,
  vehicleFormSchema,
  vehicleToFormValues,
  type VehicleFormField,
  type VehicleFormValues,
} from '../schema';
import { FUELS, VEHICLE_TYPES, type CrlvExtraction, type Vehicle } from '../types';
import { CrlvImportPanel } from './crlv-import-panel';
import { FormSection } from './form-section';

const FUEL_OPTIONS = FUELS.map((value) => ({ value, label: FUEL_LABELS[value] }));
const TYPE_OPTIONS = VEHICLE_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] }));

const SERVER_FIELD_BY_MESSAGE: Array<[RegExp, VehicleFormField]> = [
  [/placa/i, 'plate'],
  [/renavam/i, 'renavam'],
  [/chassi/i, 'chassis'],
  [/ano do modelo/i, 'modelYear'],
  [/ano de fabricação/i, 'manufactureYear'],
];

type VehicleEditorProps = {
  vehicle?: Vehicle;
  initialCrlv?: File | null;
};

export const VehicleEditor = ({ vehicle, initialCrlv }: VehicleEditorProps) => {
  const router = useRouter();
  const toast = useToast();
  const save = useSaveVehicle(vehicle?.id);
  const remove = useDeleteVehicle();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEditing = Boolean(vehicle);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: vehicle ? vehicleToFormValues(vehicle) : EMPTY_VEHICLE_FORM,
    mode: 'onTouched',
  });

  const [brand, model] = useWatch({ control, name: ['brand', 'model'] });
  const title = [brand, model].filter(Boolean).join(' ');

  const field = (name: VehicleFormField) => ({
    ...register(name),
    error: errors[name]?.message,
  });

  const applyExtraction = (extraction: CrlvExtraction) => {
    const values = extractionToFormValues(extraction);
    const filled = Object.keys(values) as VehicleFormField[];
    filled.forEach((name) => setValue(name, values[name] ?? '', { shouldDirty: true, shouldValidate: true }));

    const missing = Object.keys(extraction).length - filled.length;
    if (missing > 0) {
      toast.info(`Preenchemos ${filled.length} campos. Complete os ${missing} restantes antes de salvar.`);
    } else {
      toast.success('Dados preenchidos a partir do CRLV. Revise antes de salvar.');
    }
  };

  const onSubmit = handleSubmit((values) => {
    if (isEditing && !isDirty) {
      toast.info('Nenhuma alteração para salvar.');
      return;
    }
    save.mutate(formValuesToInput(values), {
      onSuccess: (saved) => {
        toast.success(isEditing ? 'Alterações salvas.' : `${saved.brand} ${saved.model} adicionado à garagem.`);
        router.push('/veiculos');
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 400) {
          let mapped = false;
          error.messages.forEach((message) => {
            const match = SERVER_FIELD_BY_MESSAGE.find(([pattern]) => pattern.test(message));
            if (match) {
              setError(match[1], { message });
              mapped = true;
            }
          });
          if (mapped) {
            return;
          }
        }
        if (error instanceof ApiError && error.status === 409) {
          setError('plate', { message: error.message });
          return;
        }
        toast.error(errorMessage(error));
      },
    });
  });

  const onDelete = () => {
    if (!vehicle) {
      return;
    }
    remove.mutate(vehicle.id, {
      onSuccess: () => {
        toast.success('Veículo excluído.');
        router.replace('/veiculos');
      },
      onError: (error) => {
        setConfirmDelete(false);
        toast.error(errorMessage(error));
      },
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[80rem] px-4 pt-8 pb-36 sm:px-8 sm:pt-12">
        <Link href="/veiculos" className="inline-flex items-center gap-1 text-callout text-accent hover:text-accent-hover">
          Voltar
        </Link>
        <h1 className="mt-2 text-large-title sm:text-[3.25rem] sm:leading-[1.1]">{isEditing ? 'Editar veículo' : 'Novo veículo'}</h1>

        <div className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_23.75rem] lg:grid-rows-[auto_1fr]">
          <div className="lg:col-start-2 lg:row-start-1">
            <CrlvImportPanel initialFile={initialCrlv} onExtracted={applyExtraction} />
          </div>

          <div className="flex flex-col gap-8 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <FormSection title="Identificação" description="Dados oficiais do veículo, conforme o documento.">
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <TextField
                  label="Placa"
                  placeholder="ABC1D23"
                  autoCapitalize="characters"
                  maxLength={8}
                  className="uppercase placeholder:normal-case"
                  {...field('plate')}
                />
                <TextField label="Renavam" placeholder="11 dígitos" inputMode="numeric" maxLength={11} {...field('renavam')} />
              </div>
              <TextField
                label="Chassi"
                placeholder="17 caracteres"
                autoCapitalize="characters"
                maxLength={17}
                className="uppercase placeholder:normal-case"
                {...field('chassis')}
              />
            </FormSection>

            <FormSection title="Características" description="Como o veículo aparece na sua garagem.">
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <TextField label="Marca" placeholder="Ex.: Toyota" {...field('brand')} />
                <TextField label="Modelo" placeholder="Ex.: Corolla Altis Hybrid" {...field('model')} />
              </div>
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-3">
                <TextField label="Ano de fabricação" placeholder="2022" inputMode="numeric" maxLength={4} {...field('manufactureYear')} />
                <TextField label="Ano do modelo" placeholder="2023" inputMode="numeric" maxLength={4} {...field('modelYear')} />
                <TextField label="Cor" placeholder="Ex.: Prata" {...field('color')} />
              </div>
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-3">
                <SelectField label="Combustível" options={FUEL_OPTIONS} required {...field('fuel')} />
                <SelectField label="Tipo" options={TYPE_OPTIONS} required {...field('type')} />
                <TextField label="Apelido (opcional)" placeholder="Ex.: Carro da família" maxLength={40} {...field('nickname')} />
              </div>
            </FormSection>
          </div>

          {isEditing && (
            <section className="self-start rounded-card bg-surface p-6 lg:col-start-2 lg:row-start-2">
              <h2 className="text-headline">Excluir veículo</h2>
              <p className="mt-1 text-callout font-normal text-text-secondary">
                Remove o veículo da sua garagem. Essa ação não pode ser desfeita.
              </p>
              <Button variant="destructive" size="md" fullWidth className="mt-5" onClick={() => setConfirmDelete(true)}>
                <Icon name="delete" className="size-4" />
                Excluir veículo
              </Button>
            </section>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-separator/60 bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[80rem] items-center gap-3 px-4 py-4 sm:px-8">
          <p className="hidden min-w-0 flex-1 truncate text-body text-text-secondary sm:block">
            {isEditing ? 'Editando' : 'Novo veículo'}
            {title && ` · ${title}`}
          </p>
          <Link
            href="/veiculos"
            className={buttonClasses({ variant: 'secondary', className: 'flex-1 sm:w-[11.25rem] sm:flex-none' })}
          >
            Cancelar
          </Link>
          <Button
            type="submit"
            loading={save.isPending}
            className="flex-1 sm:w-[11.25rem] sm:flex-none"
          >
            {isEditing ? 'Salvar alterações' : 'Salvar veículo'}
          </Button>
        </div>
      </div>

      {isEditing && (
        <ConfirmDialog
          open={confirmDelete}
          title="Excluir veículo?"
          description={`${title} (${vehicle?.plate}) será removido da sua garagem. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          loading={remove.isPending}
          onConfirm={onDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </form>
  );
};

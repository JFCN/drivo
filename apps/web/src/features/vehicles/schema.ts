import { z } from '@/lib/zod';
import {
  CHASSIS_PATTERN,
  normalizeChassis,
  normalizePlate,
  normalizeRenavam,
  PLATE_PATTERN,
  RENAVAM_PATTERN,
} from '@/lib/validation';
import { FUELS, VEHICLE_TYPES, type CrlvExtraction, type Fuel, type Vehicle, type VehicleInput, type VehicleType } from './types';

const MIN_YEAR = 1900;

const year = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Informe o ${label}`)
    .refine((value) => {
      const parsed = Number(value);
      return /^\d{4}$/.test(value) && parsed >= MIN_YEAR && parsed <= new Date().getFullYear() + 2;
    }, `${label.charAt(0).toUpperCase()}${label.slice(1)} inválido`);

export const vehicleFormSchema = z
  .object({
    plate: z
      .string()
      .min(1, 'Informe a placa')
      .refine((value) => PLATE_PATTERN.test(normalizePlate(value)), 'Placa inválida. Ex.: ABC1D23 ou ABC1234'),
    renavam: z
      .string()
      .min(1, 'Informe o Renavam')
      .refine((value) => RENAVAM_PATTERN.test(normalizeRenavam(value)), 'O Renavam tem até 11 dígitos'),
    chassis: z
      .string()
      .min(1, 'Informe o chassi')
      .refine((value) => CHASSIS_PATTERN.test(normalizeChassis(value)), 'O chassi tem 17 caracteres, sem I, O ou Q'),
    brand: z.string().trim().min(1, 'Informe a marca').max(60, 'Use no máximo 60 caracteres'),
    model: z.string().trim().min(1, 'Informe o modelo').max(80, 'Use no máximo 80 caracteres'),
    manufactureYear: year('ano de fabricação'),
    modelYear: year('ano do modelo'),
    color: z.string().trim().min(1, 'Informe a cor').max(30, 'Use no máximo 30 caracteres'),
    fuel: z.string().refine((value) => (FUELS as readonly string[]).includes(value), 'Selecione o combustível'),
    type: z.string().refine((value) => (VEHICLE_TYPES as readonly string[]).includes(value), 'Selecione o tipo'),
    nickname: z.string().trim().max(40, 'Use no máximo 40 caracteres'),
  })
  .superRefine((values, context) => {
    const manufacture = Number(values.manufactureYear);
    const model = Number(values.modelYear);
    if (!manufacture || !model) {
      return;
    }
    if (model < manufacture || model > manufacture + 1) {
      context.addIssue({
        code: 'custom',
        path: ['modelYear'],
        message: 'Deve ser igual ou um ano após a fabricação',
      });
    }
  });

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export type VehicleFormField = keyof VehicleFormValues;

export const EMPTY_VEHICLE_FORM: VehicleFormValues = {
  plate: '',
  renavam: '',
  chassis: '',
  brand: '',
  model: '',
  manufactureYear: '',
  modelYear: '',
  color: '',
  fuel: '',
  type: '',
  nickname: '',
};

export const vehicleToFormValues = (vehicle: Vehicle): VehicleFormValues => ({
  plate: vehicle.plate,
  renavam: vehicle.renavam,
  chassis: vehicle.chassis,
  brand: vehicle.brand,
  model: vehicle.model,
  manufactureYear: String(vehicle.manufactureYear),
  modelYear: String(vehicle.modelYear),
  color: vehicle.color,
  fuel: vehicle.fuel,
  type: vehicle.type,
  nickname: vehicle.nickname ?? '',
});

export const formValuesToInput = (values: VehicleFormValues): VehicleInput => ({
  plate: normalizePlate(values.plate),
  renavam: normalizeRenavam(values.renavam),
  chassis: normalizeChassis(values.chassis),
  brand: values.brand.trim(),
  model: values.model.trim(),
  manufactureYear: Number(values.manufactureYear),
  modelYear: Number(values.modelYear),
  color: values.color.trim(),
  fuel: values.fuel as Fuel,
  type: values.type as VehicleType,
  nickname: values.nickname.trim() || null,
});

export const extractionToFormValues = (extraction: CrlvExtraction): Partial<VehicleFormValues> => {
  const entries = Object.entries(extraction).filter(([, value]) => value !== null && value !== undefined);
  return Object.fromEntries(entries.map(([key, value]) => [key, String(value)])) as Partial<VehicleFormValues>;
};

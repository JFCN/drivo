import type { Fuel, Vehicle, VehicleType } from './types';

export const FUEL_LABELS: Record<Fuel, string> = {
  GASOLINE: 'Gasolina',
  ETHANOL: 'Etanol',
  FLEX: 'Flex',
  DIESEL: 'Diesel',
  HYBRID: 'Híbrido',
  ELECTRIC: 'Elétrico',
  CNG: 'GNV',
};

export const TYPE_LABELS: Record<VehicleType, string> = {
  CAR: 'Automóvel',
  MOTORCYCLE: 'Motocicleta',
  PICKUP: 'Caminhonete',
  TRUCK: 'Caminhão',
  VAN: 'Van ou utilitário',
};

const COLOR_DOTS: Record<string, string> = {
  prata: 'bg-zinc-300',
  branco: 'bg-white',
  branca: 'bg-white',
  preto: 'bg-black ring-1 ring-surface-4',
  preta: 'bg-black ring-1 ring-surface-4',
  cinza: 'bg-zinc-500',
  grafite: 'bg-zinc-600',
  azul: 'bg-blue-600',
  vermelho: 'bg-red-500',
  vermelha: 'bg-red-500',
  vinho: 'bg-rose-900',
  verde: 'bg-green-600',
  amarelo: 'bg-yellow-400',
  amarela: 'bg-yellow-400',
  laranja: 'bg-orange-500',
  marrom: 'bg-amber-800',
  bege: 'bg-amber-200',
  dourado: 'bg-amber-400',
  dourada: 'bg-amber-400',
  rosa: 'bg-pink-400',
  roxo: 'bg-purple-600',
  roxa: 'bg-purple-600',
};

const stripAccents = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const colorDotClass = (color: string): string => {
  const key = stripAccents(color.trim().toLowerCase()).split(/[\s-/]+/)[0];
  return COLOR_DOTS[key] ?? 'bg-transparent ring-1 ring-text-tertiary';
};

export const vehicleSummary = (vehicle: Pick<Vehicle, 'color' | 'manufactureYear' | 'modelYear' | 'fuel'>): string =>
  `${vehicle.color} · ${vehicle.manufactureYear}/${vehicle.modelYear} · ${FUEL_LABELS[vehicle.fuel]}`;

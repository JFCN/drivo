export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const PLATE_PATTERN = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;

export const RENAVAM_PATTERN = /^\d{11}$/;

export const CHASSIS_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export const normalizePlate = (value: string): string => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const normalizeRenavam = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits.length > 0 && digits.length < 11 ? digits.padStart(11, '0') : digits;
};

export const normalizeChassis = (value: string): string => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const safeRedirect = (value: string | null | undefined, fallback = '/veiculos'): string =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;

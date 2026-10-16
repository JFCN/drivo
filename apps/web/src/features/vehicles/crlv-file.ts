export const CRLV_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

export const MAX_CRLV_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = CRLV_ACCEPT.split(',');

export const validateCrlvFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato não suportado. Envie um PDF, JPG, PNG ou WEBP.';
  }
  if (file.size > MAX_CRLV_SIZE) {
    return 'O arquivo deve ter no máximo 10 MB.';
  }
  return null;
};

const MAX_SOURCE_SIZE = 15 * 1024 * 1024;
const OUTPUT_SIZE = 320;
const OUTPUT_QUALITY = 0.88;

export const validateAvatarSource = (file: File): string | null => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Escolha uma imagem JPG, PNG ou WEBP.';
  }
  if (file.size > MAX_SOURCE_SIZE) {
    return 'A imagem deve ter no máximo 15 MB.';
  }
  return null;
};

export const toSquareJpeg = async (file: File, size = OUTPUT_SIZE): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas indisponível');
  }

  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a imagem'))), 'image/jpeg', OUTPUT_QUALITY);
  });
};

const SIGNATURES: Record<string, (buffer: Buffer) => boolean> = {
  'application/pdf': (buffer) => buffer.subarray(0, 4).toString('latin1') === '%PDF',
  'image/jpeg': (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  'image/png': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (buffer) =>
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP',
};

export const matchesSignature = (mimeType: string, buffer: Buffer): boolean => SIGNATURES[mimeType]?.(buffer) ?? false;

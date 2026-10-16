import { BadGatewayException, BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Fuel, VehicleType } from '@prisma/client';
import {
  CHASSIS_PATTERN,
  normalizeChassis,
  normalizePlate,
  normalizeRenavam,
  PLATE_PATTERN,
  RENAVAM_PATTERN,
} from '../common/validation/patterns';
import { matchesSignature } from '../common/files/file-signature';
import { ALLOWED_CRLV_MIME_TYPES, CrlvMimeType, MAX_CRLV_FILE_SIZE } from './crlv.constants';
import { CrlvExtractionDto } from './dto/crlv-extraction.dto';
import { GeminiCrlvReader } from './gemini-crlv.reader';

export type UploadedCrlv = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

type RawExtraction = Record<string, unknown>;

const isAllowedMimeType = (value: string): value is CrlvMimeType =>
  (ALLOWED_CRLV_MIME_TYPES as readonly string[]).includes(value);

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const matchOrNull = (value: string, pattern: RegExp): string | null => (pattern.test(value) ? value : null);

const toYear = (value: unknown): number | null => {
  const year = Number(asText(value));
  return Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear() + 2 ? year : null;
};

const toEnum = <T extends string>(value: unknown, allowed: Record<string, T>): T | null => {
  const text = asText(value);
  return (Object.values(allowed) as string[]).includes(text) ? (text as T) : null;
};

const toTitle = (value: string): string | null =>
  value === '' ? null : value.toLowerCase().replace(/(^|\s|-|\/)(\p{L})/gu, (_match, separator: string, letter: string) => separator + letter.toUpperCase());

const keepCase = (value: string): string | null => (value === '' ? null : value);

export const normalizeExtraction = (raw: RawExtraction): CrlvExtractionDto => {
  const dto = new CrlvExtractionDto();
  dto.plate = matchOrNull(normalizePlate(asText(raw.plate)), PLATE_PATTERN);
  dto.renavam = matchOrNull(normalizeRenavam(asText(raw.renavam)), RENAVAM_PATTERN);
  dto.chassis = matchOrNull(normalizeChassis(asText(raw.chassis)), CHASSIS_PATTERN);
  dto.brand = keepCase(asText(raw.brand));
  dto.model = keepCase(asText(raw.model));
  dto.manufactureYear = toYear(raw.manufactureYear);
  dto.modelYear = toYear(raw.modelYear);
  dto.color = toTitle(asText(raw.color));
  dto.fuel = toEnum(raw.fuel, Fuel);
  dto.type = toEnum(raw.type, VehicleType);
  return dto;
};

@Injectable()
export class CrlvService {
  constructor(private readonly reader: GeminiCrlvReader) {}

  async extract(file: UploadedCrlv | undefined): Promise<CrlvExtractionDto> {
    if (!file) {
      throw new BadRequestException('Envie o arquivo do CRLV no campo "file"');
    }

    const mimeType = this.validateFile(file);
    const text = await this.reader.read({ data: file.buffer, mimeType });
    const raw = this.parse(text);

    if (raw.isCrlv !== true) {
      throw new UnprocessableEntityException('O arquivo enviado não parece ser um CRLV');
    }

    return normalizeExtraction(raw);
  }

  private validateFile(file: UploadedCrlv): CrlvMimeType {
    if (file.size > MAX_CRLV_FILE_SIZE) {
      throw new BadRequestException('O arquivo deve ter no máximo 10 MB');
    }

    if (!isAllowedMimeType(file.mimetype) || !matchesSignature(file.mimetype, file.buffer)) {
      throw new BadRequestException('Formato não suportado. Envie um PDF, JPG, PNG ou WEBP');
    }

    return file.mimetype;
  }

  private parse(text: string): RawExtraction {
    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Resposta não é um objeto');
      }
      return parsed as RawExtraction;
    } catch {
      throw new BadGatewayException('A IA retornou uma resposta inválida, tente novamente');
    }
  }
}

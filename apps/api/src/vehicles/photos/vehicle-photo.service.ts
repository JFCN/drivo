import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Vehicle, VehiclePhoto } from '@prisma/client';
import { GeminiService } from '../../common/gemini/gemini.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DownloadedImage, WikipediaClient, WikipediaLanguage } from './wikipedia.client';

type VehicleIdentity = Pick<Vehicle, 'id' | 'brand' | 'model'>;

type FoundPhoto = DownloadedImage & {
  sourceUrl: string;
};

const LANGUAGES: WikipediaLanguage[] = ['en', 'pt'];
const GEMINI_TIMEOUT_MS = 8000;

const MODEL_NAME_PROMPT = (vehicle: VehicleIdentity) => `Um usuário cadastrou o veículo "${vehicle.brand} ${vehicle.model}" no Brasil.
Responda em "title" o título do artigo da Wikipédia em inglês sobre esse modelo, sem versão, motorização ou acabamento.
Exemplos: "Toyota Corolla Altis Hybrid" → "Toyota Corolla"; "Honda HR-V EXL Turbo" → "Honda HR-V"; "Yamaha MT-03 ABS" → "Yamaha MT-03"; "Fiat Toro Volcano Diesel" → "Fiat Toro".
Se não reconhecer o modelo, responda string vazia.`;

const MODEL_NAME_SCHEMA = {
  type: 'object',
  properties: { title: { type: 'string' } },
  required: ['title'],
};

export const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const modelBase = (model: string): string => normalizeText(model.trim().split(/\s+/)[0] ?? '');

export const titleMatchesVehicle = (title: string, vehicle: VehicleIdentity): boolean => {
  const normalizedTitle = normalizeText(title);
  const base = modelBase(vehicle.model);
  return base.length > 0 && normalizedTitle.includes(normalizeText(vehicle.brand)) && normalizedTitle.includes(base);
};

@Injectable()
export class VehiclePhotoService {
  private readonly logger = new Logger(VehiclePhotoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
    private readonly wikipedia: WikipediaClient,
  ) {}

  async refresh(vehicle: VehicleIdentity): Promise<void> {
    try {
      const photo = await this.findPhoto(vehicle);
      if (!photo) {
        await this.prisma.vehiclePhoto.deleteMany({ where: { vehicleId: vehicle.id } });
        return;
      }

      const data = { data: new Uint8Array(photo.data), mimeType: photo.mimeType, sourceUrl: photo.sourceUrl };
      await this.prisma.vehiclePhoto.upsert({
        where: { vehicleId: vehicle.id },
        create: { vehicleId: vehicle.id, ...data },
        update: data,
      });
    } catch (error) {
      this.logger.warn(`Não foi possível buscar a foto de ${vehicle.brand} ${vehicle.model}: ${String(error)}`);
    }
  }

  async findForUser(userId: string, vehicleId: string): Promise<VehiclePhoto> {
    const photo = await this.prisma.vehiclePhoto.findFirst({ where: { vehicleId, vehicle: { userId } } });
    if (!photo) {
      throw new NotFoundException('Foto não encontrada');
    }
    return photo;
  }

  private async findPhoto(vehicle: VehicleIdentity): Promise<FoundPhoto | null> {
    for (const term of await this.searchTerms(vehicle)) {
      for (const language of LANGUAGES) {
        const candidate = (await this.wikipedia.searchImages(term, language)).find((image) =>
          titleMatchesVehicle(image.title, vehicle),
        );
        if (!candidate) {
          continue;
        }

        const image = await this.wikipedia.download(candidate.imageUrl);
        if (image) {
          return { ...image, sourceUrl: candidate.pageUrl };
        }
      }
    }
    return null;
  }

  private async searchTerms(vehicle: VehicleIdentity): Promise<string[]> {
    const fallback = [`${vehicle.brand} ${vehicle.model}`, `${vehicle.brand} ${vehicle.model.trim().split(/\s+/)[0]}`];
    const suggested = await this.suggestModelName(vehicle);
    return [...new Set([suggested, ...fallback].filter((term): term is string => Boolean(term?.trim())))];
  }

  private async suggestModelName(vehicle: VehicleIdentity): Promise<string | null> {
    if (!this.gemini.isConfigured) {
      return null;
    }

    try {
      const text = await this.gemini.generateJson([{ text: MODEL_NAME_PROMPT(vehicle) }], MODEL_NAME_SCHEMA, {
        timeoutMs: GEMINI_TIMEOUT_MS,
        quick: true,
      });
      const title: unknown = (JSON.parse(text) as { title?: unknown }).title;
      return typeof title === 'string' && title.trim() ? title.trim() : null;
    } catch {
      return null;
    }
  }
}

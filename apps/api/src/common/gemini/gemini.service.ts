import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiError, GoogleGenAI, type Part } from '@google/genai';
import { Env } from '../../config/env.validation';

type GenerateOptions = {
  timeoutMs?: number;
  quick?: boolean;
};

const DEFAULT_TIMEOUT_MS = 25_000;
const RETRY_OPTIONS = { attempts: 2, initialDelay: 1, maxDelay: 3 };
const NO_RETRY = { attempts: 1 };

const isOverloaded = (error: unknown): boolean =>
  error instanceof ApiError ? error.status === 503 || error.status === 500 || error.status === 504 : false;

const isQuotaExceeded = (error: unknown): boolean => error instanceof ApiError && error.status === 429;

const isTimeout = (error: unknown): boolean =>
  error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError' || /timed? ?out|abort/i.test(error.message));

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client?: GoogleGenAI;
  private readonly models: string[];

  constructor(config: ConfigService<Env, true>) {
    const apiKey = config.get('GEMINI_API_KEY', { infer: true });
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : undefined;
    this.models = [
      ...new Set([config.get('GEMINI_MODEL', { infer: true }), ...config.get('GEMINI_FALLBACK_MODELS', { infer: true })]),
    ];
  }

  get isConfigured(): boolean {
    return Boolean(this.client);
  }

  async generateJson(parts: Part[], schema: Record<string, unknown>, options: GenerateOptions = {}): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException('A integração com o Gemini não está configurada no servidor');
    }

    let lastError: unknown;
    const models = options.quick ? this.models.slice(0, 1) : this.models;
    for (const model of models) {
      try {
        const response = await this.client.models.generateContent({
          model,
          contents: [{ role: 'user', parts }],
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: schema,
            httpOptions: {
              timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
              retryOptions: options.quick ? NO_RETRY : RETRY_OPTIONS,
            },
          },
        });
        return response.text ?? '';
      } catch (error) {
        lastError = error;
        this.logger.warn(`Gemini (${model}) falhou: ${error instanceof Error ? error.message : String(error)}`);
        if (!isOverloaded(error) && !isQuotaExceeded(error) && !isTimeout(error)) {
          break;
        }
      }
    }

    throw this.toHttpError(lastError);
  }

  private toHttpError(error: unknown): Error {
    if (isQuotaExceeded(error)) {
      return new ServiceUnavailableException('Limite de uso gratuito da IA atingido. Tente novamente em instantes.');
    }
    if (isOverloaded(error) || isTimeout(error)) {
      return new ServiceUnavailableException('A IA está sobrecarregada no momento. Tente novamente em alguns instantes.');
    }
    return new BadGatewayException('Não foi possível falar com a IA agora. Tente novamente.');
  }
}

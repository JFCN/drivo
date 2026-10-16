type RawEnv = Record<string, unknown>;

export type Env = {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  WEB_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_SECONDS: number;
  COOKIE_SECURE: boolean;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  GEMINI_FALLBACK_MODELS: string[];
};

const requireString = (env: RawEnv, key: string): string => {
  const value = env[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
  return value;
};

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseList = (value: unknown, fallback: string[]): string[] => {
  if (typeof value !== 'string') {
    return fallback;
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const validateEnv = (env: RawEnv): Env => {
  const jwtSecret = requireString(env, 'JWT_SECRET');
  if (jwtSecret.length < 16) {
    throw new Error('JWT_SECRET deve ter pelo menos 16 caracteres');
  }

  return {
    NODE_ENV: typeof env.NODE_ENV === 'string' ? env.NODE_ENV : 'development',
    PORT: toNumber(env.PORT, 3333),
    DATABASE_URL: requireString(env, 'DATABASE_URL'),
    WEB_ORIGIN: typeof env.WEB_ORIGIN === 'string' ? env.WEB_ORIGIN : 'http://localhost:3000',
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN_SECONDS: toNumber(env.JWT_EXPIRES_IN_SECONDS, 86400),
    COOKIE_SECURE: env.COOKIE_SECURE === 'true',
    GEMINI_API_KEY: typeof env.GEMINI_API_KEY === 'string' && env.GEMINI_API_KEY.trim() !== '' ? env.GEMINI_API_KEY : undefined,
    GEMINI_MODEL: typeof env.GEMINI_MODEL === 'string' && env.GEMINI_MODEL.trim() !== '' ? env.GEMINI_MODEL.trim() : 'gemini-3.8-flash',
    GEMINI_FALLBACK_MODELS: parseList(env.GEMINI_FALLBACK_MODELS, ['gemini-3.5-flash-lite']),
  };
};

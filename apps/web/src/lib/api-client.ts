type ErrorBody = {
  message?: string | string[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? 'Algo deu errado');
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }

  static fromBody(status: number, body: unknown): ApiError {
    const message = (body as ErrorBody | null)?.message;
    if (Array.isArray(message)) {
      return new ApiError(status, message);
    }
    if (typeof message === 'string') {
      return new ApiError(status, [message]);
    }
    return new ApiError(status, [status >= 500 ? 'O servidor não respondeu como esperado. Tente novamente.' : 'Algo deu errado']);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | undefined;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | undefined): void => {
  unauthorizedHandler = handler;
};

const isAuthRoute = (path: string): boolean => path.startsWith('/auth/');

const buildInit = ({ method = 'GET', body, signal }: RequestOptions): RequestInit => {
  if (body instanceof FormData) {
    return { method, body, signal, credentials: 'same-origin' };
  }

  return {
    method,
    signal,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, buildInit(options));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(0, ['Não foi possível conectar ao servidor. Verifique sua conexão.']);
  }

  if (response.status === 401 && !isAuthRoute(path)) {
    unauthorizedHandler?.();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw ApiError.fromBody(response.status, body);
  }

  return body as T;
};

export const errorMessage = (error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string =>
  error instanceof ApiError ? error.message : fallback;

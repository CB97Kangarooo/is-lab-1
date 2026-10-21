/** Ошибка API в контракте бэкенда: {message, fieldErrors: {поле: сообщение}}. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Неизвестная ошибка';
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  // Путь без ведущего «/»: адрес считается от корня контекста приложения (/lab-is/), а не от корня хоста.
  let url = 'api' + path;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) {
      url += '?' + qs;
    }
  }
  return url;
}

function toApiError(status: number, data: unknown): ApiError {
  if (data && typeof data === 'object') {
    const body = data as { message?: unknown; fieldErrors?: unknown };
    const fieldErrors: Record<string, string> = {};
    if (body.fieldErrors && typeof body.fieldErrors === 'object') {
      for (const [key, value] of Object.entries(body.fieldErrors as Record<string, unknown>)) {
        if (typeof value === 'string') {
          fieldErrors[key] = value;
        }
      }
    }
    if (typeof body.message === 'string' && body.message) {
      return new ApiError(status, body.message, fieldErrors);
    }
  }
  // Ответ не в формате API (например, страница ошибки прокси или контейнера).
  if (status === 502 || status === 503 || status === 504) {
    return new ApiError(status, 'Сервер недоступен. Повторите попытку позже.');
  }
  return new ApiError(status, `Сервер ответил ошибкой (HTTP ${status})`);
}

export async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const hasBody = options.body !== undefined;
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers: hasBody
        ? { Accept: 'application/json', 'Content-Type': 'application/json' }
        : { Accept: 'application/json' },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiError(0, 'Нет связи с сервером. Проверьте подключение и повторите попытку.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw toApiError(response.status, data);
  }
  return data as T;
}

/**
 * Подключение к WebSocket-сигналам бэкенда (/ws/changes) с автопереподключением.
 * Сервер шлёт только сигналы «что-то изменилось» — данные клиент перезапрашивает сам по REST.
 */

export type ChangeEntity = 'human' | 'car';
export type ChangeKind = 'created' | 'updated' | 'deleted' | 'bulk';

export type RealtimeEvent =
  | { type: 'change'; entity: ChangeEntity; change: ChangeKind; id: number | null }
  /** Соединение (пере)установлено: пока его не было, сигналы могли потеряться — перезапросить всё видимое. */
  | { type: 'resync' };

/** connecting — первое подключение; reconnecting — связь потеряна, пробуем снова; offline — несколько попыток подряд неудачны. */
export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting' | 'offline';

const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;
/** После стольких неудачных попыток подряд индикатор показывает «нет связи» (попытки продолжаются). */
const OFFLINE_AFTER_ATTEMPTS = 3;
/** Heartbeat: сервер закрывает сессию без входящих сообщений через 90 с (ChangeEndpoint.MAX_IDLE_MS). */
const PING_INTERVAL_MS = 25_000;
/** Нет ответа на ping — соединение «полуоткрытое» (сон ноутбука, смена сети): переподключаемся. */
const PONG_TIMEOUT_MS = 10_000;

const ENTITIES: readonly string[] = ['human', 'car'];
const KINDS: readonly string[] = ['created', 'updated', 'deleted', 'bulk'];

/** ws(s)://<хост>/<контекст>/ws/changes — от адреса страницы, как и относительные запросы к api/. */
export function changesUrl(): string {
  const url = new URL('ws/changes', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.hash = '';
  url.search = '';
  return url.toString();
}

export function parseSignal(data: unknown): RealtimeEvent | null {
  if (typeof data !== 'string') return null;
  try {
    const raw = JSON.parse(data) as { entity?: unknown; change?: unknown; id?: unknown };
    if (typeof raw.entity !== 'string' || !ENTITIES.includes(raw.entity)) return null;
    if (typeof raw.change !== 'string' || !KINDS.includes(raw.change)) return null;
    const id = typeof raw.id === 'number' ? raw.id : null;
    return { type: 'change', entity: raw.entity as ChangeEntity, change: raw.change as ChangeKind, id };
  } catch {
    return null;
  }
}

export class ChangeSocket {
  private ws: WebSocket | null = null;
  /** Неудачных попыток подряд; сбрасывается при успешном подключении. */
  private attempt = 0;
  private stopped = false;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private pingTimer: ReturnType<typeof setInterval> | undefined;
  private pongTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly url: string,
    private readonly onEvent: (event: RealtimeEvent) => void,
    private readonly onStatus: (status: ConnectionStatus) => void,
  ) {}

  start(): void {
    this.stopped = false;
    window.addEventListener('online', this.handleOnline);
    this.onStatus('connecting');
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    window.removeEventListener('online', this.handleOnline);
    clearTimeout(this.retryTimer);
    this.dropSocket();
  }

  private connect(): void {
    clearTimeout(this.retryTimer);
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      this.attempt = 0;
      this.onStatus('open');
      this.startHeartbeat();
      // и при первом подключении: между загрузкой страницы по REST и открытием сокета тоже могли быть изменения
      this.onEvent({ type: 'resync' });
    };
    ws.onmessage = (message) => {
      clearTimeout(this.pongTimer);
      this.pongTimer = undefined;
      if (message.data === 'pong') return;
      const event = parseSignal(message.data);
      if (event) this.onEvent(event);
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.dropSocket();
      if (!this.stopped) this.scheduleReconnect();
    };
    // onerror всегда сопровождается onclose — переподключение планируется там
    ws.onerror = null;
  }

  private scheduleReconnect(): void {
    this.attempt += 1;
    this.onStatus(this.attempt > OFFLINE_AFTER_ATTEMPTS || !navigator.onLine ? 'offline' : 'reconnecting');
    const ceiling = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (this.attempt - 1));
    // половина задержки случайная: после рестарта сервера клиенты не приходят все в одну миллисекунду
    const delay = ceiling / 2 + Math.random() * (ceiling / 2);
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.connect(), delay);
  }

  /** Сеть вернулась — не ждём конца паузы, пробуем сразу. */
  private readonly handleOnline = () => {
    if (!this.stopped && this.ws === null) {
      this.attempt = 0;
      this.connect();
    }
  };

  private startHeartbeat(): void {
    clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      const ws = this.ws;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send('ping');
      if (this.pongTimer === undefined) {
        this.pongTimer = setTimeout(() => {
          // close() на мёртвом соединении может ждать onclose долго — отцепляемся и переподключаемся сами
          this.dropSocket();
          if (!this.stopped) this.scheduleReconnect();
        }, PONG_TIMEOUT_MS);
      }
    }, PING_INTERVAL_MS);
  }

  private dropSocket(): void {
    clearInterval(this.pingTimer);
    clearTimeout(this.pongTimer);
    this.pingTimer = undefined;
    this.pongTimer = undefined;
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }
  }
}

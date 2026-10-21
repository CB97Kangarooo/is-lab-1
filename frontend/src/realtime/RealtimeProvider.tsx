import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChangeSocket, changesUrl } from './socket';
import type { ConnectionStatus, RealtimeEvent } from './socket';

type Listener = (event: RealtimeEvent) => void;

interface Notice {
  id: number;
  text: string;
}

interface RealtimeContextValue {
  status: ConnectionStatus;
  subscribe: (listener: Listener) => () => void;
  /** Ненавязчивое уведомление внизу экрана (например, «герой удалён другим пользователем»). */
  notify: (text: string) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const NOTICE_TTL_MS = 6_000;

/** Одно WebSocket-соединение на вкладку; страницы и диалоги подписываются на сигналы через useChangeSignal. */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [notices, setNotices] = useState<Notice[]>([]);
  const listeners = useRef(new Set<Listener>());
  const nextNoticeId = useRef(0);

  useEffect(() => {
    const socket = new ChangeSocket(
      changesUrl(),
      (event) => listeners.current.forEach((listener) => listener(event)),
      setStatus,
    );
    socket.start();
    return () => socket.stop();
  }, []);

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const dismiss = useCallback((id: number) => setNotices((prev) => prev.filter((n) => n.id !== id)), []);

  const notify = useCallback(
    (text: string) => {
      const id = ++nextNoticeId.current;
      setNotices((prev) => [...prev.filter((n) => n.text !== text), { id, text }].slice(-3));
      setTimeout(() => dismiss(id), NOTICE_TTL_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ status, subscribe, notify }), [status, subscribe, notify]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <div className="notices" role="status" aria-live="polite">
        {notices.map((notice) => (
          <div key={notice.id} className="notice">
            <span>{notice.text}</span>
            <button type="button" className="btn" onClick={() => dismiss(notice.id)}>
              скрыть
            </button>
          </div>
        ))}
      </div>
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime вне RealtimeProvider');
  }
  return context;
}

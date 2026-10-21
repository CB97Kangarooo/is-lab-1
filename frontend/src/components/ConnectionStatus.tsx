import { useRealtime } from '../realtime/RealtimeProvider';
import type { ConnectionStatus as Status } from '../realtime/socket';

const LABELS: Record<Status, string> = {
  connecting: 'подключение…',
  open: 'онлайн',
  reconnecting: 'переподключение…',
  offline: 'нет связи',
};

const TITLES: Record<Status, string> = {
  connecting: 'Подключаемся к серверу изменений',
  open: 'Изменения других пользователей появляются сразу',
  reconnecting: 'Связь потеряна, переподключаемся; после восстановления данные обновятся',
  offline: 'Сервер недоступен; попытки подключения продолжаются',
};

/** Маленький индикатор соединения в шапке: квадратик и подпись, без иконок. */
export function ConnectionStatus() {
  const { status } = useRealtime();
  return (
    <span className="live" data-state={status} title={TITLES[status]} role="status" aria-live="polite">
      {LABELS[status]}
    </span>
  );
}

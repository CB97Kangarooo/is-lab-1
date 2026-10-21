import { useEffect, useRef } from 'react';
import { useRealtime } from './RealtimeProvider';
import type { ChangeEntity, RealtimeEvent } from './socket';

interface Options {
  /** Какие сущности интересны; resync приходит всегда. По умолчанию — все. */
  entities?: readonly ChangeEntity[];
  /** Окно склейки: все сигналы за это время уходят в обработчик одной пачкой. */
  windowMs?: number;
}

const DEFAULT_WINDOW_MS = 200;

/**
 * Подписка на сигналы об изменениях. Сигналы склеиваются: первый открывает окно windowMs,
 * всё, что пришло за окно, уходит в handler одним вызовом. Окно не продлевается новыми
 * сигналами, поэтому поток событий массовой операции не откладывает перезапрос бесконечно,
 * а сервер получает один запрос на пачку, а не по запросу на сигнал.
 */
export function useChangeSignal(handler: (events: RealtimeEvent[]) => void, options: Options = {}): void {
  const { subscribe } = useRealtime();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const entitiesKey = options.entities?.join(',') ?? '';

  useEffect(() => {
    const entities = entitiesKey ? entitiesKey.split(',') : null;
    let batch: RealtimeEvent[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribe((event) => {
      if (event.type === 'change' && entities && !entities.includes(event.entity)) return;
      batch.push(event);
      if (timer === undefined) {
        timer = setTimeout(() => {
          const events = batch;
          batch = [];
          timer = undefined;
          handlerRef.current(events);
        }, windowMs);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [subscribe, entitiesKey, windowMs]);
}

/** Касается ли пачка сигналов конкретного героя (его правка, массовая операция или пересинхронизация). */
export function touchesHero(events: RealtimeEvent[], id: number): { deleted: boolean; maybeChanged: boolean } {
  let deleted = false;
  let maybeChanged = false;
  for (const event of events) {
    if (event.type === 'resync') {
      maybeChanged = true;
    } else if (event.entity === 'human') {
      if (event.change === 'bulk') maybeChanged = true;
      if (event.id === id && event.change === 'deleted') deleted = true;
      if (event.id === id && event.change === 'updated') maybeChanged = true;
    }
  }
  return { deleted, maybeChanged };
}

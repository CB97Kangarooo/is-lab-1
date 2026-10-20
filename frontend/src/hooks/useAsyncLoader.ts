import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';
import { errorMessage, isAbortError } from '../api/client';

interface LoaderState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Загрузка данных с защитой от гонок: ответ устаревшего запроса отбрасывается,
 * предыдущий запрос отменяется. Запускается при смене deps; reload() перезапрашивает
 * одним вызовом с текущими параметрами (его дёргают после изменений и, на шаге 7, по push-событию).
 * Прежние данные остаются на экране, пока идёт перезагрузка.
 */
export function useAsyncLoader<T>(load: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<LoaderState<T>>({ data: null, loading: true, error: null });
  const loadRef = useRef(load);
  loadRef.current = load;
  const sequence = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const run = useCallback(() => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    const id = ++sequence.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    loadRef.current(current.signal).then(
      (data) => {
        if (id === sequence.current) {
          setState({ data, loading: false, error: null });
        }
      },
      (error: unknown) => {
        if (id !== sequence.current || isAbortError(error)) {
          return;
        }
        setState((prev) => ({ ...prev, loading: false, error: errorMessage(error) }));
      },
    );
  }, []);

  useEffect(() => {
    run();
    return () => {
      sequence.current++;
      controller.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: run };
}

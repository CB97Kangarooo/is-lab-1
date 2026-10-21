import { useCallback, useRef } from 'react';

/** Запоминает элемент, вызвавший диалог, и возвращает на него фокус после закрытия. */
export function useFocusReturn() {
  const opener = useRef<HTMLElement | null>(null);

  const remember = useCallback(() => {
    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, []);

  const restore = useCallback(() => {
    const element = opener.current;
    opener.current = null;
    // после размонтирования диалога — иначе фокус перехватит браузер
    setTimeout(() => {
      if (element && element.isConnected) {
        element.focus();
      }
    }, 0);
  }, []);

  return { remember, restore };
}

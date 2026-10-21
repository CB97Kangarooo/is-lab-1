import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { Hero } from '../api/types';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { dossierNumber } from '../lib/format';
import { useRealtime } from '../realtime/RealtimeProvider';
import { HeroDeleteDialog } from './HeroDeleteDialog';
import { HeroForm } from './HeroForm';
import { HeroView } from './HeroView';

type DialogState =
  | { kind: 'create' }
  | { kind: 'view'; id: string }
  | { kind: 'edit'; hero: Hero }
  | { kind: 'delete'; hero: Hero };

/**
 * Все диалоги героя в одном месте (создание, просмотр по id, правка, удаление) — их используют
 * и таблица, и спецоперации. Открыт не больше одного; после любого изменения вызывается onChanged,
 * фокус при закрытии возвращается на элемент, открывший первый диалог.
 * Если открытого героя удалил другой пользователь (сигнал по WebSocket), диалог закрывается
 * с уведомлением внизу экрана.
 */
export function useHeroDialogs(onChanged: () => void): {
  dialogs: ReactNode;
  openCreate: () => void;
  openView: (id: number | string) => void;
  openEdit: (hero: Hero) => void;
  openDelete: (hero: Hero) => void;
} {
  const [state, setState] = useState<DialogState | null>(null);
  const focus = useFocusReturn();
  const { notify } = useRealtime();

  const open = useCallback(
    (next: DialogState) => {
      setState((prev) => {
        if (prev === null) focus.remember();
        return next;
      });
    },
    [focus],
  );

  const close = () => {
    setState(null);
    focus.restore();
  };

  const changed = () => {
    close();
    onChanged();
  };

  const removed = (id: number | string) => {
    close();
    notify(`Герой ${dossierNumber(id)} удалён другим пользователем`);
    onChanged();
  };

  let dialogs: ReactNode = null;
  if (state?.kind === 'create') {
    dialogs = <HeroForm onClose={close} onSaved={changed} />;
  } else if (state?.kind === 'view') {
    dialogs = (
      <HeroView
        key={state.id}
        id={state.id}
        onClose={close}
        onEdit={(hero) => open({ kind: 'edit', hero })}
        onDelete={(hero) => open({ kind: 'delete', hero })}
        onRemoved={() => removed(state.id)}
      />
    );
  } else if (state?.kind === 'edit') {
    const id = state.hero.id;
    dialogs = (
      <HeroForm
        key={id}
        hero={state.hero}
        onClose={close}
        onSaved={changed}
        onGone={onChanged}
        onRemoved={() => removed(id)}
      />
    );
  } else if (state?.kind === 'delete') {
    const id = state.hero.id;
    dialogs = <HeroDeleteDialog hero={state.hero} onClose={close} onDeleted={changed} onRemoved={() => removed(id)} />;
  }

  return {
    dialogs,
    openCreate: () => open({ kind: 'create' }),
    openView: (id) => open({ kind: 'view', id: String(id) }),
    openEdit: (hero) => open({ kind: 'edit', hero }),
    openDelete: (hero) => open({ kind: 'delete', hero }),
  };
}

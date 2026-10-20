import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { Hero } from '../api/types';
import { useFocusReturn } from '../hooks/useFocusReturn';
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
      />
    );
  } else if (state?.kind === 'edit') {
    dialogs = <HeroForm key={state.hero.id} hero={state.hero} onClose={close} onSaved={changed} onGone={onChanged} />;
  } else if (state?.kind === 'delete') {
    dialogs = <HeroDeleteDialog hero={state.hero} onClose={close} onDeleted={changed} />;
  }

  return {
    dialogs,
    openCreate: () => open({ kind: 'create' }),
    openView: (id) => open({ kind: 'view', id: String(id) }),
    openEdit: (hero) => open({ kind: 'edit', hero }),
    openDelete: (hero) => open({ kind: 'delete', hero }),
  };
}

import { useState } from 'react';
import { ApiError, errorMessage } from '../api/client';
import { deleteHero } from '../api/heroes';
import type { Hero } from '../api/types';
import { dossierNumber } from '../lib/format';
import { Dialog } from './Dialog';

interface HeroDeleteDialogProps {
  hero: Hero;
  onClose: () => void;
  /** Удалён (в том числе кем-то другим): родитель закрывает диалог и перезагружает данные. */
  onDeleted: () => void;
}

export function HeroDeleteDialog({ hero, onClose, onDeleted }: HeroDeleteDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteHero(hero.id);
      onDeleted();
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        onDeleted(); // уже удалён другим пользователем — цель достигнута
        return;
      }
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Dialog number={dossierNumber(hero.id)} title="Удалить героя?" onClose={onClose} narrow>
      {error && (
        <div className="banner" role="alert">
          {error}
        </div>
      )}
      <p className="dossier-text">
        Герой «{hero.name}» будет удалён безвозвратно.{' '}
        {hero.car ? (
          <>
            Связанная машина «{hero.car.name ?? 'без названия'}» (id {hero.car.id}) будет удалена вместе с героем.
          </>
        ) : (
          <span className="muted">Машины у героя нет.</span>
        )}
      </p>
      <div className="dossier-actions">
        <button type="button" className="btn" onClick={onClose} disabled={busy}>
          Отмена
        </button>
        <button type="button" className="btn btn-primary" onClick={confirm} disabled={busy}>
          {busy ? 'Удаление…' : 'Удалить'}
        </button>
      </div>
    </Dialog>
  );
}

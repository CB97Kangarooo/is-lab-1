import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getHero } from '../api/heroes';
import type { Hero } from '../api/types';
import { useAsyncLoader } from '../hooks/useAsyncLoader';
import { touchesHero, useChangeSignal } from '../realtime/useChangeSignal';
import { dossierNumber, formatDate } from '../lib/format';
import { Dash, Flag, ImpactSpeed, MoodScale, Text } from './Cells';
import { Dialog } from './Dialog';

interface HeroViewProps {
  id: string;
  onClose: () => void;
  onEdit: (hero: Hero) => void;
  onDelete: (hero: Hero) => void;
  /** Героя удалил другой пользователь: родитель закрывает диалог и показывает уведомление. */
  onRemoved: () => void;
}

export function HeroView({ id, onClose, onEdit, onDelete, onRemoved }: HeroViewProps) {
  const loader = useAsyncLoader((signal) => getHero(id, signal), [id]);
  const hero = loader.data;
  const notFound = loader.error !== null && loader.errorStatus === 404;

  // Просмотр (не правка) можно обновлять сразу; если версия поменялась — говорим об этом, а не подменяем молча.
  const [note, setNote] = useState<string | null>(null);
  const pushed = useRef(false);
  const seenVersion = useRef<number | null>(null);

  useChangeSignal(
    (events) => {
      const { deleted, maybeChanged } = touchesHero(events, Number(id));
      if (deleted) {
        onRemoved();
      } else if (maybeChanged && hero) {
        pushed.current = true;
        loader.reload();
      }
    },
    { entities: ['human'] },
  );

  useEffect(() => {
    if (loader.loading) return;
    if (pushed.current && notFound) {
      onRemoved(); // удалён, пока шла пересинхронизация после обрыва
    } else if (hero && !loader.error) {
      if (pushed.current && seenVersion.current !== null && hero.version !== seenVersion.current) {
        setNote('Данные обновлены: героя изменил другой пользователь.');
      }
      seenVersion.current = hero.version;
    }
    pushed.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader.loading, hero, notFound]);

  return (
    <Dialog number={dossierNumber(id)} title="Досье героя" onClose={onClose}>
      {loader.loading && !hero && <p className="muted">Загрузка…</p>}
      {notFound && (
        <p role="alert" className="banner">
          Герой с id {id} не найден.
        </p>
      )}
      {loader.error && !notFound && (
        <div className="banner" role="alert">
          {loader.error}
          <br />
          <button type="button" className="btn" onClick={loader.reload}>
            Повторить
          </button>
        </div>
      )}
      {note && hero && !loader.error && (
        <p className="banner" role="status">
          {note}
        </p>
      )}
      {hero && !loader.error && (
        <>
          <dl className="facts">
            <Fact label="id">{hero.id}</Fact>
            <Fact label="name">{hero.name}</Fact>
            <Fact label="x">{hero.coordinates.x}</Fact>
            <Fact label="y">{hero.coordinates.y}</Fact>
            <Fact label="creationDate">{formatDate(hero.creationDate)}</Fact>
            <Fact label="realHero">
              <Flag value={hero.realHero} />
            </Fact>
            <Fact label="hasToothpick">
              <Flag value={hero.hasToothpick} />
            </Fact>
            <Fact label="mood">
              <MoodScale mood={hero.mood} />
            </Fact>
            <Fact label="impactSpeed">
              <ImpactSpeed value={hero.impactSpeed} />
            </Fact>
            <Fact label="weaponType">
              <Text value={hero.weaponType} />
            </Fact>
          </dl>
          <section className="car-block" aria-label="Связанная машина">
            <h3>Машина</h3>
            {hero.car ? (
              <dl className="facts">
                <Fact label="car.id">{hero.car.id}</Fact>
                <Fact label="car.name">
                  <Text value={hero.car.name} />
                </Fact>
                <Fact label="car.cool">
                  <Flag value={hero.car.cool} />
                </Fact>
              </dl>
            ) : (
              <p className="muted">
                <Dash /> машины нет
              </p>
            )}
          </section>
        </>
      )}
      <div className="dossier-actions">
        <button type="button" className="btn" onClick={onClose}>
          Закрыть
        </button>
        {hero && !loader.error && (
          <>
            <button type="button" className="btn" onClick={() => onDelete(hero)}>
              Удалить
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onEdit(hero)}>
              Изменить
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

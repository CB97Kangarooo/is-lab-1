import type { ReactNode } from 'react';
import { getHero } from '../api/heroes';
import type { Hero } from '../api/types';
import { useAsyncLoader } from '../hooks/useAsyncLoader';
import { dossierNumber, formatDate } from '../lib/format';
import { Dash, Flag, ImpactSpeed, MoodScale, Text } from './Cells';
import { Dialog } from './Dialog';

interface HeroViewProps {
  id: string;
  onClose: () => void;
  onEdit: (hero: Hero) => void;
  onDelete: (hero: Hero) => void;
}

export function HeroView({ id, onClose, onEdit, onDelete }: HeroViewProps) {
  const loader = useAsyncLoader((signal) => getHero(id, signal), [id]);
  const hero = loader.data;
  const notFound = loader.error !== null && loader.errorStatus === 404;

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

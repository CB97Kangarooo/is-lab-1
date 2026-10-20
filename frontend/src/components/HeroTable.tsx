import type { ReactNode } from 'react';
import type { Hero } from '../api/types';
import type { SortState } from '../hooks/useHeroTable';
import { formatDate } from '../lib/format';
import { Flag, ImpactSpeed, MoodScale, Text } from './Cells';

interface Column {
  id: string;
  /** Ключ сортировки на сервере. */
  sortKey: string;
  label: string;
  numeric?: boolean;
  wide?: boolean;
  render: (hero: Hero) => ReactNode;
}

const COLUMNS: Column[] = [
  { id: 'id', sortKey: 'id', label: 'id', numeric: true, render: (h) => h.id },
  { id: 'name', sortKey: 'name', label: 'name', wide: true, render: (h) => h.name },
  { id: 'x', sortKey: 'coordinates.x', label: 'x', numeric: true, render: (h) => h.coordinates.x },
  { id: 'y', sortKey: 'coordinates.y', label: 'y', numeric: true, render: (h) => h.coordinates.y },
  { id: 'creationDate', sortKey: 'creationDate', label: 'creationDate', render: (h) => formatDate(h.creationDate) },
  { id: 'realHero', sortKey: 'realHero', label: 'realHero', render: (h) => <Flag value={h.realHero} /> },
  { id: 'hasToothpick', sortKey: 'hasToothpick', label: 'hasToothpick', render: (h) => <Flag value={h.hasToothpick} /> },
  { id: 'car.name', sortKey: 'car.name', label: 'car.name', wide: true, render: (h) => <Text value={h.car?.name} /> },
  { id: 'car.cool', sortKey: 'car.cool', label: 'car.cool', render: (h) => <Flag value={h.car ? h.car.cool : null} /> },
  { id: 'mood', sortKey: 'mood', label: 'mood', render: (h) => <MoodScale mood={h.mood} /> },
  { id: 'impactSpeed', sortKey: 'impactSpeed', label: 'impactSpeed', render: (h) => <ImpactSpeed value={h.impactSpeed} /> },
  { id: 'weaponType', sortKey: 'weaponType', label: 'weaponType', render: (h) => <Text value={h.weaponType} /> },
];

interface HeroTableProps {
  items: Hero[];
  sort: SortState | null;
  onSort: (key: string) => void;
  loading: boolean;
  hasData: boolean;
  error: string | null;
  onRetry: () => void;
}

export function HeroTable({ items, sort, onSort, loading, hasData, error, onRetry }: HeroTableProps) {
  const colSpan = COLUMNS.length;

  let stateRow: ReactNode = null;
  if (error) {
    stateRow = (
      <div className="state" role="alert">
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Повторить
        </button>
      </div>
    );
  } else if (!hasData) {
    stateRow = <div className="state muted">Загрузка…</div>;
  } else if (items.length === 0) {
    stateRow = <div className="state muted">Героев нет</div>;
  }

  return (
    <>
      <div className="table-wrap" aria-busy={loading}>
        <table className="grid">
          <thead>
            <tr>
              {COLUMNS.map((col) => {
                const active = sort?.key === col.sortKey ? sort : null;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    className={col.numeric ? 'num' : undefined}
                    aria-sort={active ? (active.order === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button type="button" className="th-sort" onClick={() => onSort(col.sortKey)}>
                      {col.label}
                      <span className="sort-mark" aria-hidden="true">
                        {active ? (active.order === 'asc' ? '↑' : '↓') : ''}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!error &&
              items.map((hero) => (
                <tr key={hero.id}>
                  {COLUMNS.map((col) => (
                    <td key={col.id} className={[col.numeric ? 'num' : '', col.wide ? 'wide' : ''].join(' ').trim() || undefined}>
                      {col.render(hero)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={colSpan} className="state-cell">
                {stateRow}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

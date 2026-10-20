import { useCallback, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  assignLadaKalina,
  averageImpactSpeed,
  findHeroesByNamePrefix,
  setAllMoodSorrow,
  sumImpactSpeed,
} from '../api/special';
import { errorMessage } from '../api/client';
import type { Hero } from '../api/types';
import { MoodScale } from '../components/Cells';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useHeroDialogs } from '../components/HeroDialogs';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { dossierNumber, formatNumber } from '../lib/format';

interface OperationState<T> {
  loading: boolean;
  result: T | null;
  error: string | null;
}

function useOperation<T>() {
  const [state, setState] = useState<OperationState<T>>({ loading: false, result: null, error: null });
  const run = useCallback(async (fn: () => Promise<T>) => {
    setState({ loading: true, result: null, error: null });
    try {
      setState({ loading: false, result: await fn(), error: null });
    } catch (error) {
      setState({ loading: false, result: null, error: errorMessage(error) });
    }
  }, []);
  return { ...state, run };
}

function Block({ no, title, hint, children }: { no: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="op" aria-labelledby={`op-${no}`}>
      <div className="op-head">
        <span className="op-no">{no}</span>
        <h2 id={`op-${no}`}>{title}</h2>
        {hint && <p className="muted">{hint}</p>}
      </div>
      <div className="op-body">{children}</div>
    </section>
  );
}

function Outcome({ error, children }: { error: string | null; children?: ReactNode }) {
  return (
    <div className="outcome" aria-live="polite">
      {error ? (
        <p className="banner" role="alert">
          {error}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

export function SpecialPage() {
  const sum = useOperation<{ value: number }>();
  const average = useOperation<{ value: number | null }>();
  const search = useOperation<Hero[]>();
  const sorrow = useOperation<{ affected: number }>();
  const lada = useOperation<{ affected: number }>();

  const [prefix, setPrefix] = useState('');
  const searched = useRef<string | null>(null);
  const [confirm, setConfirm] = useState<'sorrow' | 'lada' | null>(null);
  const focus = useFocusReturn();

  const runSearch = useCallback(
    (value: string) => {
      searched.current = value;
      return search.run(() => findHeroesByNamePrefix(value));
    },
    [search.run], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // правка или удаление из результата поиска: повторяем тот же поиск
  const heroDialogs = useHeroDialogs(() => {
    if (searched.current !== null) void runSearch(searched.current);
  });

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    void runSearch(prefix);
  };

  const askConfirm = (kind: 'sorrow' | 'lada') => {
    focus.remember();
    setConfirm(kind);
  };
  const closeConfirm = () => {
    setConfirm(null);
    focus.restore();
  };
  const runConfirmed = () => {
    const kind = confirm;
    closeConfirm();
    if (kind === 'sorrow') void sorrow.run(setAllMoodSorrow);
    if (kind === 'lada') void lada.run(assignLadaKalina);
  };

  return (
    <>
      <div className="page-head">
        <h1>Спецоперации</h1>
      </div>

      <div className="ops">
        <Block no="01" title="Сумма impactSpeed" hint="По всем героям.">
          <button type="button" className="btn btn-primary" onClick={() => void sum.run(sumImpactSpeed)} disabled={sum.loading}>
            {sum.loading ? 'Считаю…' : 'Посчитать сумму'}
          </button>
          <Outcome error={sum.error}>
            {sum.result && <p className="result">{formatNumber(sum.result.value, 0)}</p>}
          </Outcome>
        </Block>

        <Block no="02" title="Среднее impactSpeed" hint="Если героев нет, среднее не определено.">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void average.run(averageImpactSpeed)}
            disabled={average.loading}
          >
            {average.loading ? 'Считаю…' : 'Посчитать среднее'}
          </button>
          <Outcome error={average.error}>
            {average.result && (
              <p className="result">{average.result.value === null ? '—' : formatNumber(average.result.value, 4)}</p>
            )}
          </Outcome>
        </Block>

        <Block
          no="03"
          title="Поиск по началу name"
          hint="Регистр учитывается. Пустая строка вернёт всех героев."
        >
          <form className="op-form" onSubmit={submitSearch}>
            <div className="field">
              <label htmlFor="prefix">подстрока</label>
              <input
                id="prefix"
                type="text"
                value={prefix}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setPrefix(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={search.loading}>
              {search.loading ? 'Ищу…' : 'Найти'}
            </button>
          </form>
          <Outcome error={search.error}>
            {search.result && (
              <>
                <p className="result-count">
                  Найдено: <b>{search.result.length}</b>
                </p>
                {search.result.length > 0 && (
                  <ul className="found" aria-label="Найденные герои">
                    {search.result.map((hero) => (
                      <li key={hero.id}>
                        <button
                          type="button"
                          className="found-row"
                          onClick={() => heroDialogs.openView(hero.id)}
                          aria-label={`Открыть героя ${hero.name}, id ${hero.id}`}
                        >
                          <span className="found-id">{dossierNumber(hero.id)}</span>
                          <span className="found-name">{hero.name}</span>
                          <MoodScale mood={hero.mood} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </Outcome>
        </Block>

        <Block no="04" title="Всем героям настроение SORROW" hint="Изменяет всех героев сразу.">
          <button type="button" className="btn btn-primary" onClick={() => askConfirm('sorrow')} disabled={sorrow.loading}>
            {sorrow.loading ? 'Выполняю…' : 'Выполнить'}
          </button>
          <Outcome error={sorrow.error}>
            {sorrow.result && (
              <p className="result-count">
                Затронуто записей: <b>{sorrow.result.affected}</b>
              </p>
            )}
          </Outcome>
        </Block>

        <Block no="05" title="Пересадить героев без машины на красные Lada Kalina" hint="Создаёт машины и привязывает их.">
          <button type="button" className="btn btn-primary" onClick={() => askConfirm('lada')} disabled={lada.loading}>
            {lada.loading ? 'Выполняю…' : 'Выполнить'}
          </button>
          <Outcome error={lada.error}>
            {lada.result && (
              <p className="result-count">
                Затронуто записей: <b>{lada.result.affected}</b>
              </p>
            )}
          </Outcome>
        </Block>
      </div>

      {confirm === 'sorrow' && (
        <ConfirmDialog
          number="операция 04"
          title="Установить SORROW всем?"
          confirmLabel="Выполнить"
          onConfirm={runConfirmed}
          onCancel={closeConfirm}
        >
          <p>Настроение всех героев станет SORROW. Отменить операцию нельзя.</p>
        </ConfirmDialog>
      )}
      {confirm === 'lada' && (
        <ConfirmDialog
          number="операция 05"
          title="Пересадить героев на Lada Kalina?"
          confirmLabel="Выполнить"
          onConfirm={runConfirmed}
          onCancel={closeConfirm}
        >
          <p>Каждому герою без машины будет создана и привязана новая Lada Kalina. Отменить операцию нельзя.</p>
          <p className="muted">В модели Car нет поля цвета, поэтому «красная» только в названии операции.</p>
        </ConfirmDialog>
      )}
      {heroDialogs.dialogs}
    </>
  );
}

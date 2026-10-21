import { useEffect, useState } from 'react';
import { listHeroes } from '../api/heroes';
import type { SortOrder } from '../api/heroes';
import { useAsyncLoader } from './useAsyncLoader';

export interface SortState {
  key: string;
  order: SortOrder;
}

export const PAGE_SIZES = [10, 25, 50] as const;

export const FILTER_KEYS = ['name', 'car.name', 'mood', 'weaponType'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Record<FilterKey, string>;

const EMPTY_FILTERS: Filters = { name: '', 'car.name': '', mood: '', weaponType: '' };
const FILTER_DEBOUNCE_MS = 300;

const sameFilters = (a: Filters, b: Filters) => FILTER_KEYS.every((key) => a[key].trim() === b[key].trim());

/** Состояние таблицы героев: страница, размер, сортировка — всё серверное. */
export function useHeroTable() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGE_SIZES[0]);
  const [sort, setSort] = useState<SortState | null>(null);
  // inputs — то, что набрано в полях; filters — применённое (после debounce) и уходящее на сервер.
  const [filterInputs, setFilterInputs] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sameFilters(filters, filterInputs)) {
        setFilters(filterInputs);
        setPage(0);
      }
    }, FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // filters намеренно не в deps: таймер запускается только набором текста
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterInputs]);

  const loader = useAsyncLoader(
    (signal) =>
      listHeroes(
        { offset: page * size, limit: size, sort: sort?.key, order: sort?.order, filters },
        signal,
      ),
    [page, size, sort, filters],
  );

  const total = loader.data?.total ?? 0;
  const lastPage = Math.max(0, Math.ceil(total / size) - 1);

  // После удаления последней записи страница может опустеть — возвращаемся на последнюю непустую.
  useEffect(() => {
    if (!loader.loading && loader.data && loader.data.items.length === 0 && page > lastPage) {
      setPage(lastPage);
    }
  }, [loader.loading, loader.data, page, lastPage]);

  // asc → desc → без сортировки (порядок по id).
  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, order: 'asc' };
      if (prev.order === 'asc') return { key, order: 'desc' };
      return null;
    });
    setPage(0);
  };

  const setFilter = (key: FilterKey, value: string) => setFilterInputs((prev) => ({ ...prev, [key]: value }));

  const filtered = FILTER_KEYS.some((key) => filters[key].trim() !== '');

  const changeSize = (next: number) => {
    setSize(next);
    setPage(0);
  };

  return {
    items: loader.data?.items ?? [],
    total,
    hasData: loader.data !== null,
    loading: loader.loading,
    error: loader.error,
    reload: loader.reload,
    page,
    size,
    sort,
    filterInputs,
    filtered,
    setFilter,
    lastPage,
    setPage,
    changeSize,
    toggleSort,
  };
}

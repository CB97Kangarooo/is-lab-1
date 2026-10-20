import { useEffect, useState } from 'react';
import { listHeroes } from '../api/heroes';
import type { SortOrder } from '../api/heroes';
import { useAsyncLoader } from './useAsyncLoader';

export interface SortState {
  key: string;
  order: SortOrder;
}

export const PAGE_SIZES = [10, 25, 50] as const;

/** Состояние таблицы героев: страница, размер, сортировка — всё серверное. */
export function useHeroTable() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGE_SIZES[0]);
  const [sort, setSort] = useState<SortState | null>(null);

  const loader = useAsyncLoader(
    (signal) =>
      listHeroes({ offset: page * size, limit: size, sort: sort?.key, order: sort?.order }, signal),
    [page, size, sort],
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
    lastPage,
    setPage,
    changeSize,
    toggleSort,
  };
}

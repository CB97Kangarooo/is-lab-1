import { request } from './client';
import type { Hero, PageResponse } from './types';

export type SortOrder = 'asc' | 'desc';

export interface HeroListParams {
  offset: number;
  limit: number;
  sort?: string;
  order?: SortOrder;
  /** Ключи — имена колонок бэкенда (name, car.name, mood, weaponType); пустые значения не отправляются. */
  filters?: Record<string, string>;
}

export function listHeroes(params: HeroListParams, signal?: AbortSignal): Promise<PageResponse<Hero>> {
  const query: Record<string, string | number | undefined> = {
    offset: params.offset,
    limit: params.limit,
  };
  if (params.sort) {
    query.sort = params.sort;
    query.order = params.order ?? 'asc';
  }
  for (const [key, value] of Object.entries(params.filters ?? {})) {
    if (value.trim()) {
      query['filter.' + key] = value.trim();
    }
  }
  return request<PageResponse<Hero>>('GET', '/human-beings', { query, signal });
}

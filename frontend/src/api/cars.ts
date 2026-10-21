import { request } from './client';
import type { CarWithOwner, PageResponse } from './types';

/** Бэкенд ограничивает страницу 100 записями (Pagination.MAX_LIMIT). */
const SERVER_MAX_LIMIT = 100;
/** Сколько свободных машин максимум подгружаем в выпадающий список. */
export const FREE_CARS_CAP = 1000;

export interface CarListParams {
  offset: number;
  limit: number;
  freeOnly?: boolean;
}

export function listCars(params: CarListParams, signal?: AbortSignal): Promise<PageResponse<CarWithOwner>> {
  return request<PageResponse<CarWithOwner>>('GET', '/cars', {
    query: { offset: params.offset, limit: params.limit, free: params.freeOnly ? true : undefined },
    signal,
  });
}

export interface FreeCars {
  items: CarWithOwner[];
  total: number;
  truncated: boolean;
}

/** Все свободные машины (постранично по 100, не больше FREE_CARS_CAP) — для выбора в форме героя. */
export async function listFreeCars(signal?: AbortSignal): Promise<FreeCars> {
  const items: CarWithOwner[] = [];
  let total = 0;
  for (;;) {
    const page = await listCars({ offset: items.length, limit: SERVER_MAX_LIMIT, freeOnly: true }, signal);
    total = page.total;
    items.push(...page.items);
    if (page.items.length === 0 || items.length >= total || items.length >= FREE_CARS_CAP) {
      break;
    }
  }
  return { items, total, truncated: items.length < total };
}

export interface CarInput {
  name: string | null;
  cool: boolean | null;
}

export function createCar(input: CarInput): Promise<CarWithOwner> {
  return request<CarWithOwner>('POST', '/cars', { body: input });
}

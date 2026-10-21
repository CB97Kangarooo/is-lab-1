export const MOODS = ['SORROW', 'GLOOM', 'RAGE'] as const;
export type Mood = (typeof MOODS)[number];

export const WEAPON_TYPES = ['HAMMER', 'AXE', 'KNIFE', 'MACHINE_GUN'] as const;
export type WeaponType = (typeof WEAPON_TYPES)[number];

export interface Car {
  id: number;
  name: string | null;
  cool: boolean | null;
}

export interface CarOwner {
  id: number;
  name: string;
}

/** Машина в списке: плоский JSON, владелец — null, если машина свободна. */
export interface CarWithOwner extends Car {
  owner: CarOwner | null;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Hero {
  id: number;
  name: string;
  coordinates: Coordinates;
  /** ISO-дата yyyy-MM-dd */
  creationDate: string;
  realHero: boolean;
  hasToothpick: boolean;
  car: Car | null;
  mood: Mood;
  impactSpeed: number;
  weaponType: WeaponType | null;
  version: number;
}

/** Тело POST /human-beings; PUT добавляет version. */
export interface HeroInput {
  name: string;
  coordinates: Coordinates;
  realHero: boolean;
  hasToothpick: boolean;
  carId: number | null;
  mood: Mood;
  impactSpeed: number;
  weaponType: WeaponType | null;
}

export interface HeroUpdate extends HeroInput {
  version: number;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export const MAX_IMPACT_SPEED = 213;
export const MAX_Y = 119;

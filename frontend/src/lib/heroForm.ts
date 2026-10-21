import { MAX_IMPACT_SPEED, MAX_Y, MOODS, WEAPON_TYPES } from '../api/types';
import type { Hero, HeroInput, Mood, WeaponType } from '../api/types';

export type FieldName = 'name' | 'x' | 'y' | 'mood' | 'impactSpeed' | 'weaponType' | 'carId';
export type FieldErrors = Partial<Record<FieldName, string>>;

/** Значения формы — строки: так проще держать частично введённые числа. */
export interface HeroFormValues {
  name: string;
  x: string;
  y: string;
  realHero: boolean;
  hasToothpick: boolean;
  carId: string;
  mood: string;
  impactSpeed: string;
  weaponType: string;
}

export const EMPTY_FORM: HeroFormValues = {
  name: '',
  x: '',
  y: '',
  realHero: false,
  hasToothpick: false,
  carId: '',
  mood: '',
  impactSpeed: '',
  weaponType: '',
};

/** Клиентские проверки зеркалят правила сервера; источник истины — сервер. */
export function validate(values: HeroFormValues): FieldErrors {
  const errors: FieldErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Имя не может быть пустым';
  } else if (values.name.length > 255) {
    errors.name = 'Имя — не длиннее 255 символов';
  }

  if (values.x.trim() === '') {
    errors.x = 'Координата X обязательна';
  } else if (!Number.isFinite(Number(values.x))) {
    errors.x = 'Координата X должна быть числом';
  }

  if (values.y.trim() === '') {
    errors.y = 'Координата Y обязательна';
  } else if (!Number.isFinite(Number(values.y))) {
    errors.y = 'Координата Y должна быть числом';
  } else if (Number(values.y) > MAX_Y) {
    errors.y = `Координата Y не может быть больше ${MAX_Y}`;
  }

  const speed = values.impactSpeed.trim();
  if (speed === '') {
    errors.impactSpeed = 'Скорость удара обязательна';
  } else if (!/^-?\d+$/.test(speed)) {
    errors.impactSpeed = 'Скорость удара — целое число';
  } else if (Number(speed) > MAX_IMPACT_SPEED) {
    errors.impactSpeed = `Скорость удара не может быть больше ${MAX_IMPACT_SPEED}`;
  }

  if (!values.mood) {
    errors.mood = 'Настроение обязательно';
  }

  return errors;
}

export function fromHero(hero: Hero): HeroFormValues {
  return {
    name: hero.name,
    x: String(hero.coordinates.x),
    y: String(hero.coordinates.y),
    realHero: hero.realHero,
    hasToothpick: hero.hasToothpick,
    carId: hero.car ? String(hero.car.id) : '',
    mood: hero.mood,
    impactSpeed: String(hero.impactSpeed),
    weaponType: hero.weaponType ?? '',
  };
}

/** Только для значений, прошедших validate(). */
export function toInput(values: HeroFormValues): HeroInput {
  return {
    name: values.name.trim(),
    coordinates: { x: Number(values.x), y: Number(values.y) },
    realHero: values.realHero,
    hasToothpick: values.hasToothpick,
    carId: values.carId ? Number(values.carId) : null,
    mood: values.mood as Mood,
    impactSpeed: Number(values.impactSpeed),
    weaponType: values.weaponType ? (values.weaponType as WeaponType) : null,
  };
}

const SERVER_FIELD_MAP: Record<string, FieldName> = {
  name: 'name',
  'coordinates.x': 'x',
  'coordinates.y': 'y',
  mood: 'mood',
  impactSpeed: 'impactSpeed',
  weaponType: 'weaponType',
  carId: 'carId',
};

/** fieldErrors сервера → ошибки полей формы; всё, что не удалось сопоставить, уходит в баннер. */
export function mapServerErrors(fieldErrors: Record<string, string>): { fields: FieldErrors; rest: string[] } {
  const fields: FieldErrors = {};
  const rest: string[] = [];
  for (const [key, message] of Object.entries(fieldErrors)) {
    const field = SERVER_FIELD_MAP[key];
    if (field) {
      fields[field] = message;
    } else {
      rest.push(message);
    }
  }
  return { fields, rest };
}

export { MOODS, WEAPON_TYPES };

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError, errorMessage } from '../api/client';
import { listFreeCars } from '../api/cars';
import { createHero, getHero, updateHero } from '../api/heroes';
import type { Car, Hero } from '../api/types';
import { useAsyncLoader } from '../hooks/useAsyncLoader';
import { touchesHero, useChangeSignal } from '../realtime/useChangeSignal';
import { EMPTY_FORM, MOODS, WEAPON_TYPES, fromHero, mapServerErrors, toInput, validate } from '../lib/heroForm';
import type { FieldErrors, FieldName, HeroFormValues } from '../lib/heroForm';
import { dossierNumber } from '../lib/format';
import { Dialog } from './Dialog';
import { Field } from './Field';

export function carLabel(car: Car): string {
  const cool = car.cool === true ? ' · cool' : car.cool === false ? ' · не cool' : '';
  return `${car.id} · ${car.name ?? 'без названия'}${cool}`;
}

interface Banner {
  text: string;
  /** Конфликт версий: можно загрузить актуальную версию героя. */
  canReload: boolean;
}

interface HeroFormProps {
  /** Есть — режим правки, нет — создание. */
  hero?: Hero;
  onClose: () => void;
  /** Изменение сохранено: родитель закрывает диалог и перезагружает таблицу. */
  onSaved: () => void;
  /** Героя удалили другие (выяснилось при сохранении): родитель перезагружает таблицу, диалог остаётся с сообщением. */
  onGone?: () => void;
  /** Сигнал по WebSocket: героя удалил другой пользователь — родитель закрывает диалог с уведомлением. */
  onRemoved?: () => void;
}

export function HeroForm({ hero, onClose, onSaved, onGone, onRemoved }: HeroFormProps) {
  const isEdit = Boolean(hero);
  const [values, setValues] = useState<HeroFormValues>(hero ? fromHero(hero) : EMPTY_FORM);
  const [version, setVersion] = useState(hero?.version ?? 0);
  // машина героя на момент загрузки формы: она входит в список вместе со свободными
  const [currentCar, setCurrentCar] = useState<Car | null>(hero?.car ?? null);
  const [touched, setTouched] = useState<Set<FieldName>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [gone, setGone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  /** Идёт наш собственный PUT: сигнал о нём приходит раньше HTTP-ответа (рассылка сразу после commit). */
  const savingRef = useRef(false);

  const cars = useAsyncLoader((signal) => listFreeCars(signal), []);
  const carOptions: Car[] = useMemo(() => {
    const free: Car[] = cars.data?.items ?? [];
    return currentCar && !free.some((c) => c.id === currentCar.id) ? [currentCar, ...free] : free;
  }, [cars.data, currentCar]);

  // справочник свободных машин: новую машину могли создать, свободную — занять другим героем
  useChangeSignal(cars.reload);

  // Правка открыта, а героя изменили или удалили другие. Форму не перезаписываем: показываем баннер
  // с кнопкой «Загрузить актуальную версию»; сохранение старой версии сервер всё равно отклонит (409, @Version).
  useChangeSignal(
    async (events) => {
      if (!hero || gone || savingRef.current) return;
      const { deleted, maybeChanged } = touchesHero(events, hero.id);
      if (deleted) {
        if (onRemoved) onRemoved();
        else markGone();
        return;
      }
      if (!maybeChanged) return;
      try {
        const fresh = await getHero(hero.id);
        if (!savingRef.current && fresh.version !== version) {
          setBanner({
            text:
              'Героя изменил другой пользователь. Загрузите актуальную версию — несохранённые правки будут заменены. ' +
              'Если сохранить сейчас, сервер отклонит изменение из-за конфликта версий.',
            canReload: true,
          });
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404 && !savingRef.current) {
          if (onRemoved) onRemoved();
          else markGone();
        }
      }
    },
    { entities: ['human'] },
  );

  // выбранную свободную машину занял другой пользователь: возвращаем исходный выбор и говорим почему
  useEffect(() => {
    if (!cars.data || !values.carId) return;
    if (!carOptions.some((car) => String(car.id) === values.carId)) {
      setValues((prev) => ({ ...prev, carId: currentCar ? String(currentCar.id) : '' }));
      setServerErrors((prev) => ({ ...prev, carId: 'Эту машину занял другой пользователь — выберите другую' }));
    }
    // реагируем только на новый список машин, а не на каждый выбор в форме
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.data]);

  const clientErrors = validate(values);
  const errorFor = (field: FieldName): string | undefined => {
    if (serverErrors[field]) return serverErrors[field];
    return submitted || touched.has(field) ? clientErrors[field] : undefined;
  };

  // после неудачной отправки фокус уходит на первое поле с ошибкой
  useEffect(() => {
    if (submitCount > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [submitCount]);

  const setField = <K extends keyof HeroFormValues>(key: K, value: HeroFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in serverErrors) {
      setServerErrors((prev) => {
        const next = { ...prev };
        delete next[key as FieldName];
        return next;
      });
    }
  };

  const blur = (field: FieldName) => setTouched((prev) => new Set(prev).add(field));

  const loadActual = async () => {
    if (!hero) return;
    setSaving(true);
    try {
      const fresh = await getHero(hero.id);
      setValues(fromHero(fresh));
      setVersion(fresh.version);
      setCurrentCar(fresh.car);
      setServerErrors({});
      setTouched(new Set());
      setSubmitted(false);
      setBanner(null);
      cars.reload();
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        markGone();
      } else {
        setBanner({ text: errorMessage(error), canReload: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const markGone = () => {
    setGone(true);
    setBanner({ text: 'Герой удалён другим пользователем. Закройте окно: таблица обновлена.', canReload: false });
    onGone?.();
  };

  const handleError = async (error: unknown) => {
    if (!(error instanceof ApiError)) {
      setBanner({ text: errorMessage(error), canReload: false });
      return;
    }
    const { fields, rest } = mapServerErrors(error.fieldErrors);

    if (error.status === 404) {
      // При правке 404 — либо героя удалили, либо нет выбранной машины: проверяем героя.
      if (hero) {
        try {
          await getHero(hero.id);
        } catch (check) {
          if (check instanceof ApiError && check.status === 404) {
            markGone();
            return;
          }
        }
      }
      if (values.carId) {
        fields.carId = error.message;
      }
    }

    // 409 без поля carId — конфликт версий (@Version)
    if (error.status === 409 && !fields.carId && rest.length === 0 && Object.keys(fields).length === 0) {
      setBanner({ text: error.message, canReload: isEdit });
      return;
    }

    if (fields.carId) {
      // машину успели занять или удалить: обновляем список и возвращаем исходный выбор
      setValues((prev) => ({ ...prev, carId: currentCar ? String(currentCar.id) : '' }));
      cars.reload();
    }
    setServerErrors(fields);
    const mapped = Object.keys(fields).length > 0;
    if (rest.length > 0) {
      setBanner({ text: rest.join('. '), canReload: false });
    } else if (!mapped) {
      setBanner({ text: error.message, canReload: false });
    } else {
      setBanner(null);
    }
    setSubmitCount((n) => n + 1);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(clientErrors).length > 0) {
      setSubmitCount((n) => n + 1);
      return;
    }
    setSaving(true);
    savingRef.current = true;
    setBanner(null);
    setServerErrors({});
    try {
      if (hero) {
        await updateHero(hero.id, { ...toInput(values), version });
      } else {
        await createHero(toInput(values));
      }
      onSaved();
    } catch (error) {
      savingRef.current = false;
      await handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || gone;

  return (
    <Dialog
      number={dossierNumber(hero?.id)}
      title={isEdit ? 'Правка героя' : 'Новый герой'}
      onClose={onClose}
    >
      {banner && (
        <div className="banner" role="alert">
          {banner.text}
          {banner.canReload && (
            <>
              <br />
              <button type="button" className="btn" onClick={loadActual} disabled={saving}>
                Загрузить актуальную версию
              </button>
            </>
          )}
        </div>
      )}
      <form ref={formRef} onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field id="hf-name" label="name" error={errorFor('name')} wide>
            {(c) => (
              <input
                {...c}
                type="text"
                value={values.name}
                maxLength={255}
                required
                autoComplete="off"
                onChange={(e) => setField('name', e.target.value)}
                onBlur={() => blur('name')}
              />
            )}
          </Field>
          <Field id="hf-x" label="x" error={errorFor('x')}>
            {(c) => (
              <input
                {...c}
                type="number"
                step="any"
                required
                value={values.x}
                onChange={(e) => setField('x', e.target.value)}
                onBlur={() => blur('x')}
              />
            )}
          </Field>
          <Field id="hf-y" label="y (не больше 119)" error={errorFor('y')}>
            {(c) => (
              <input
                {...c}
                type="number"
                step="any"
                max={119}
                required
                value={values.y}
                onChange={(e) => setField('y', e.target.value)}
                onBlur={() => blur('y')}
              />
            )}
          </Field>
          <Field id="hf-mood" label="mood" error={errorFor('mood')}>
            {(c) => (
              <select
                {...c}
                required
                value={values.mood}
                onChange={(e) => setField('mood', e.target.value)}
                onBlur={() => blur('mood')}
              >
                <option value="">— выберите —</option>
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="hf-speed" label="impactSpeed (целое, не больше 213)" error={errorFor('impactSpeed')}>
            {(c) => (
              <input
                {...c}
                type="number"
                step={1}
                max={213}
                required
                inputMode="numeric"
                value={values.impactSpeed}
                onChange={(e) => setField('impactSpeed', e.target.value)}
                onBlur={() => blur('impactSpeed')}
              />
            )}
          </Field>
          <Field id="hf-weapon" label="weaponType" error={errorFor('weaponType')}>
            {(c) => (
              <select {...c} value={values.weaponType} onChange={(e) => setField('weaponType', e.target.value)}>
                <option value="">—</option>
                {WEAPON_TYPES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div className="field checks">
            <label className="check">
              <input
                type="checkbox"
                checked={values.realHero}
                onChange={(e) => setField('realHero', e.target.checked)}
              />
              realHero
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={values.hasToothpick}
                onChange={(e) => setField('hasToothpick', e.target.checked)}
              />
              hasToothpick
            </label>
          </div>
          <Field
            id="hf-car"
            label={isEdit ? 'car — свободные и текущая' : 'car — свободные машины'}
            error={errorFor('carId')}
            wide
          >
            {(c) => (
              <select {...c} value={values.carId} onChange={(e) => setField('carId', e.target.value)}>
                <option value="">без машины</option>
                {carOptions.map((car) => (
                  <option key={car.id} value={car.id}>
                    {carLabel(car)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div className="span-2 hint">
            {cars.loading && !cars.data && <span className="muted">Загрузка списка машин…</span>}
            {cars.error && (
              <span>
                Список машин не загружен: {cars.error}{' '}
                <button type="button" className="btn" onClick={cars.reload}>
                  повторить
                </button>
              </span>
            )}
            {cars.data?.truncated && (
              <span className="muted">
                Показаны первые {cars.data.items.length} из {cars.data.total} свободных машин.
              </span>
            )}
            {isEdit && currentCar && values.carId !== String(currentCar.id) && (
              <span className="muted">Отвязанная машина останется в базе свободной.</span>
            )}
          </div>
        </div>
        <div className="dossier-actions">
          <button type="button" className="btn" onClick={onClose}>
            {gone ? 'Закрыть' : 'Отмена'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

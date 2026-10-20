import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError, errorMessage } from '../api/client';
import { createCar } from '../api/cars';
import { dossierNumber } from '../lib/format';
import { Dialog } from './Dialog';
import { Field } from './Field';

interface CarFormProps {
  onClose: () => void;
  onSaved: () => void;
}

/** Создание машины: name и cool оба необязательны. */
export function CarForm({ onClose, onSaved }: CarFormProps) {
  const [name, setName] = useState('');
  const [cool, setCool] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setBanner(null);
    setNameError(undefined);
    try {
      await createCar({ name: name.trim() === '' ? null : name.trim(), cool: cool === '' ? null : cool === 'true' });
      onSaved();
    } catch (error) {
      if (error instanceof ApiError) {
        const { name: serverName, ...other } = error.fieldErrors;
        setNameError(serverName);
        const rest = Object.values(other);
        if (rest.length > 0) setBanner(rest.join('. '));
        else if (!serverName) setBanner(error.message);
      } else {
        setBanner(errorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog number={dossierNumber(null)} title="Новая машина" onClose={onClose} narrow>
      {banner && (
        <div className="banner" role="alert">
          {banner}
        </div>
      )}
      <form onSubmit={submit} noValidate>
        <div className="form-grid single">
          <Field id="cf-name" label="name" error={nameError}>
            {(c) => (
              <input
                {...c}
                type="text"
                value={name}
                maxLength={255}
                autoComplete="off"
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(undefined);
                }}
              />
            )}
          </Field>
          <Field id="cf-cool" label="cool">
            {(c) => (
              <select {...c} value={cool} onChange={(e) => setCool(e.target.value)}>
                <option value="">— не задано —</option>
                <option value="true">да</option>
                <option value="false">нет</option>
              </select>
            )}
          </Field>
        </div>
        <div className="dossier-actions">
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение…' : 'Создать'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

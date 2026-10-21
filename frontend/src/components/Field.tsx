import type { ReactNode } from 'react';

export interface ControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  wide?: boolean;
  children: (control: ControlProps) => ReactNode;
}

/** Подпись + контрол + ошибка под полем. Контрол получает id и aria-атрибуты. */
export function Field({ id, label, error, wide, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={wide ? 'field span-2' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined })}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

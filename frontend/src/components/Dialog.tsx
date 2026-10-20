import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

interface DialogProps {
  /** Номер дела в «язычке» карточки, например «№ 000123». */
  number: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  narrow?: boolean;
}

/** Карточка-досье на нативном <dialog>: Esc закрывает, фокус заперт внутри, подложка без blur. */
export function Dialog({ number, title, onClose, children, narrow }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={narrow ? 'dossier dossier-narrow' : 'dossier'}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Esc: закрываем через состояние родителя, чтобы фокус вернулся на вызвавший элемент
        event.preventDefault();
        onClose();
      }}
    >
      <div className="dossier-tab" aria-hidden="true">
        {number}
      </div>
      <div className="dossier-body">
        <header className="dossier-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="btn" onClick={onClose}>
            Закрыть
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

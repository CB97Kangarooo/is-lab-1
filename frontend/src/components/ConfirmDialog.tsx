import type { ReactNode } from 'react';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  number: string;
  title: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
}

export function ConfirmDialog({ number, title, confirmLabel, onConfirm, onCancel, children }: ConfirmDialogProps) {
  return (
    <Dialog number={number} title={title} onClose={onCancel} narrow>
      <div className="dossier-text">{children}</div>
      <div className="dossier-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

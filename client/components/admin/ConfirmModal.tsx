'use client';

import styles from './ConfirmModal.module.css';

export function ConfirmModal({
  open,
  title,
  text,
  confirmLabel = 'Confirmer',
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.text}>{text}</p>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} onClick={onClose}>
            Annuler
          </button>
          <button className={styles.dangerButton} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

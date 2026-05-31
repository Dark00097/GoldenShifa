'use client';

import { Minus, Plus } from 'lucide-react';
import styles from './QuantitySelector.module.css';

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  compact = false
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}) {
  return (
    <div className={`${styles.selector} ${compact ? styles.compact : ''}`}>
      <button className={styles.button} onClick={() => onChange(Math.max(min, value - 1))} aria-label="Diminuer" type="button">
        <Minus size={16} />
      </button>
      <span className={styles.value}>{value}</span>
      <button className={styles.button} onClick={() => onChange(Math.min(max, value + 1))} aria-label="Augmenter" type="button">
        <Plus size={16} />
      </button>
    </div>
  );
}

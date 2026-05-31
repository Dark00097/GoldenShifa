// components/admin/AdminStatusBadge.tsx
import { statusLabel } from '@/lib/admin';
import styles from './AdminStatusBadge.module.css';

const statusClass: Record<string, string> = {
  PENDING:    'pending',
  CONFIRMED:  'confirmed',
  PAID:       'paid',
  PROCESSING: 'processing',
  SHIPPED:    'shipped',
  DELIVERED:  'delivered',
  CANCELLED:  'cancelled',
};

export function AdminStatusBadge({ status }: { status: string }) {
  const mod = statusClass[status] ?? 'pending';
  return (
    <span className={`${styles.badge} ${styles[mod]}`}>
      <span className={styles.dot} />
      {statusLabel(status)}
    </span>
  );
}
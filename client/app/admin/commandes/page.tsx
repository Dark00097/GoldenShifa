// app/admin/commandes/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Eye, Receipt } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminTable } from '@/components/admin/AdminTable';
import { apiFetch, money } from '@/lib/api';
import { adminStatusOptions } from '@/lib/admin';
import { useToast } from '@/lib/toast';
import { Order } from '@/types';
import styles from './page.module.css';

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');

  async function load() {
    const data = await apiFetch<{ orders: Order[] }>('/admin/orders');
    setOrders(data.orders);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, [toast]);

  async function updateStatus(id: number, next: string) {
    await apiFetch(`/admin/orders/${id}/status`, {
      method: 'PUT',
      data: { status: next },
    });
    toast.success('Statut mis à jour.');
    await load();
  }

  const rows = useMemo(
    () => (status ? orders.filter((o) => o.status === status) : orders),
    [orders, status],
  );

  const fullDate = (value: string) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));

  return (
    <AdminShell title="Commandes">

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderGlow} />
        <div className={styles.pageHeaderLeft}>
          <span className={styles.pageHeaderIcon}>
            <Receipt size={18} />
          </span>
          <div>
            <h2 className={styles.pageHeaderTitle}>Gestion des commandes</h2>
            <p className={styles.pageHeaderSub}>
              {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        {/* quick stat pills */}
        <div className={styles.pageHeaderStats}>
          {[
            {
              label: 'En attente',
              count: orders.filter((o) => o.status === 'PENDING').length,
              cls: styles.statPillAmber,
            },
            {
              label: 'Expédiées',
              count: orders.filter((o) => o.status === 'SHIPPED').length,
              cls: styles.statPillBlue,
            },
            {
              label: 'Livrées',
              count: orders.filter((o) => o.status === 'DELIVERED').length,
              cls: styles.statPillGreen,
            },
          ].map(({ label, count, cls }) => (
            <div key={label} className={`${styles.statPill} ${cls}`}>
              <strong>{count}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <AdminTable
          rows={rows}
          searchPlaceholder="Rechercher une commande, un client…"
          filter={
            <select
              className={styles.statusFilter}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {adminStatusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          }
          columns={[
            {
              header: 'Commande',
              searchValue: (row) => row.orderNumber,
              render: (row) => (
                <span className={styles.orderNumber}>{row.orderNumber}</span>
              ),
            },
            {
              header: 'Date',
              render: (row) => (
                <span className={styles.dateText}>
                  {row.createdAt ? fullDate(row.createdAt) : '—'}
                </span>
              ),
            },
            {
              header: 'Client',
              searchValue: (row) => `${row.customerName} ${row.customerEmail}`,
              render: (row) => (
                <div className={styles.clientCell}>
                  <span className={styles.clientName}>
                    {row.customerName || 'Client invité'}
                  </span>
                  <span className={styles.clientEmail}>{row.customerEmail}</span>
                </div>
              ),
            },
            {
              header: 'Total',
              render: (row) => (
                <span className={styles.totalText}>{money(row.total)}</span>
              ),
            },
            {
              header: 'Statut',
              render: (row) => <AdminStatusBadge status={row.status} />,
            },
            {
              header: 'Mise à jour',
              render: (row) => (
                <select
                  className={styles.statusSelect}
                  value={row.status}
                  onChange={(e) => void updateStatus(row.id, e.target.value)}
                >
                  {adminStatusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ),
            },
            {
              header: 'Détail',
              render: (row) => (
                <Link
                  className={styles.viewBtn}
                  href={`/admin/commandes/${row.id}`}
                  title="Voir le détail"
                >
                  <Eye size={14} />
                </Link>
              ),
            },
          ]}
        />
      </div>
    </AdminShell>
  );
}
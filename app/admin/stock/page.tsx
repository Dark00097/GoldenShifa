// app/admin/stock/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Boxes, CheckCircle2, TrendingDown } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable } from '@/components/admin/AdminTable';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { InventoryRow } from '@/types';
import styles from './page.module.css';

export default function AdminStockPage() {
  const toast = useToast();
  const [inventory, setInventory] = useState<InventoryRow[]>([]);

  async function load() {
    const data = await apiFetch<{ inventory: InventoryRow[] }>('/admin/inventory');
    setInventory(data.inventory);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, [toast]);

  async function update(row: InventoryRow, stock: number) {
    await apiFetch(`/admin/inventory/${row.product.id}`, {
      method: 'PUT',
      data: { stock },
    });
    toast.success('Stock mis à jour.');
    await load();
  }

  const lowStock  = inventory.filter((r) => r.stock <= r.lowStockAt && r.stock > 0).length;
  const outStock  = inventory.filter((r) => r.stock === 0).length;
  const okStock   = inventory.filter((r) => r.stock > r.lowStockAt).length;

  return (
    <AdminShell title="Stock">

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderGlow} />

        <div className={styles.pageHeaderLeft}>
          <span className={styles.pageHeaderIcon}>
            <Boxes size={18} />
          </span>
          <div>
            <h2 className={styles.pageHeaderTitle}>Gestion du stock</h2>
            <p className={styles.pageHeaderSub}>
              {inventory.length} produit{inventory.length !== 1 ? 's' : ''} en inventaire
            </p>
          </div>
        </div>

        {/* stat pills */}
        <div className={styles.pageHeaderStats}>
          {[
            {
              label: 'OK',
              count: okStock,
              icon: CheckCircle2,
              cls: styles.statPillGreen,
            },
            {
              label: 'Stock faible',
              count: lowStock,
              icon: TrendingDown,
              cls: styles.statPillAmber,
            },
            {
              label: 'Rupture',
              count: outStock,
              icon: AlertTriangle,
              cls: styles.statPillRed,
            },
          ].map(({ label, count, icon: Icon, cls }) => (
            <div key={label} className={`${styles.statPill} ${cls}`}>
              <div className={styles.statPillTop}>
                <Icon size={14} />
                <strong>{count}</strong>
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <AdminTable
          rows={inventory}
          searchPlaceholder="Rechercher un produit, un SKU…"
          columns={[
            {
              header: 'Produit',
              searchValue: (row) => row.product.name,
              render: (row) => (
                <span className={styles.productName}>{row.product.name}</span>
              ),
            },
            {
              header: 'Catégorie',
              searchValue: (row) => row.product.category?.name || '',
              render: (row) =>
                row.product.category?.name ? (
                  <span className={styles.categoryPill}>
                    {row.product.category.name}
                  </span>
                ) : (
                  <span className={styles.dimText}>—</span>
                ),
            },
            {
              header: 'SKU',
              searchValue: (row) => row.sku,
              render: (row) => (
                <span className={styles.skuText}>{row.sku}</span>
              ),
            },
            {
              header: 'Stock actuel',
              render: (row) => {
                const isEmpty = row.stock === 0;
                const isLow   = row.stock <= row.lowStockAt && row.stock > 0;
                return (
                  <div className={styles.stockInputWrap}>
                    <input
                      className={`${styles.stockInput} ${
                        isEmpty ? styles.stockInputEmpty :
                        isLow   ? styles.stockInputLow   :
                                  styles.stockInputOk
                      }`}
                      type="number"
                      defaultValue={row.stock}
                      min={0}
                      onBlur={(e) => void update(row, Number(e.target.value))}
                    />
                  </div>
                );
              },
            },
            {
              header: 'Seuil alerte',
              render: (row) => (
                <span className={styles.thresholdText}>{row.lowStockAt}</span>
              ),
            },
            {
              header: 'Statut',
              render: (row) => {
                if (row.stock === 0) {
                  return (
                    <span className={`${styles.statusBadge} ${styles.statusEmpty}`}>
                      <span className={styles.statusDot} />
                      Rupture
                    </span>
                  );
                }
                if (row.stock <= row.lowStockAt) {
                  return (
                    <span className={`${styles.statusBadge} ${styles.statusLow}`}>
                      <span className={styles.statusDot} />
                      Stock faible
                    </span>
                  );
                }
                return (
                  <span className={`${styles.statusBadge} ${styles.statusOk}`}>
                    <span className={styles.statusDot} />
                    OK
                  </span>
                );
              },
            },
            {
              header: 'Niveau',
              render: (row) => {
                const pct = Math.min(
                  100,
                  Math.round((row.stock / Math.max(row.lowStockAt * 2, 1)) * 100),
                );
                const isEmpty = row.stock === 0;
                const isLow   = row.stock <= row.lowStockAt && row.stock > 0;
                return (
                  <div className={styles.levelWrap}>
                    <div className={styles.levelTrack}>
                      <div
                        className={`${styles.levelFill} ${
                          isEmpty ? styles.levelFillEmpty :
                          isLow   ? styles.levelFillLow   :
                                    styles.levelFillOk
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={styles.levelPct}>{pct}%</span>
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </AdminShell>
  );
}
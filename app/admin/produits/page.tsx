// app/admin/produits/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Edit, Package, Plus, Trash2 } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable } from '@/components/admin/AdminTable';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { apiFetch, money } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Product } from '@/types';
import styles from './page.module.css';

export default function AdminProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    const data = await apiFetch<{ products: Product[] }>('/admin/products');
    setProducts(data.products);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, [toast]);

  async function remove() {
    if (!deleteId) return;
    await apiFetch(`/admin/products/${deleteId}`, { method: 'DELETE' });
    toast.success('Produit supprimé.');
    setDeleteId(null);
    await load();
  }

  return (
    <AdminShell
      title="Produits"
      action={
        <Link href="/admin/produits/nouveau" className={styles.primaryAction}>
          <Plus size={15} />
          Nouveau produit
        </Link>
      }
    >
      {/* ── Page header card ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderGlow} />
        <div className={styles.pageHeaderLeft}>
          <span className={styles.pageHeaderIcon}>
            <Package size={18} />
          </span>
          <div>
            <h2 className={styles.pageHeaderTitle}>Gestion des produits</h2>
            <p className={styles.pageHeaderSub}>
              {products.length} produit{products.length !== 1 ? 's' : ''} dans le catalogue
            </p>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <AdminTable
          rows={products}
          searchPlaceholder="Rechercher un produit…"
          columns={[
            {
              header: 'Produit',
              searchValue: (row) => row.name,
              render: (row) => (
                <span className={styles.productName}>{row.name}</span>
              ),
            },
            {
              header: 'Catégorie',
              searchValue: (row) => row.category?.name || '',
              render: (row) => (
                <span className={styles.categoryPill}>
                  {row.category?.name || '—'}
                </span>
              ),
            },
            {
              header: 'Prix',
              render: (row) => (
                <span className={styles.priceText}>{money(row.price)}</span>
              ),
            },
            {
              header: 'Remise',
              render: (row) =>
                row.compareAt ? (
                  <span className={styles.compareText}>
                    {money(row.compareAt)}
                  </span>
                ) : (
                  <span className={styles.dimText}>—</span>
                ),
            },
            {
              header: 'Stock',
              render: (row) => {
                const stock = row.inventory?.stock ?? 0;
                const low   = row.inventory?.lowStockAt ?? 5;
                return (
                  <span className={`${styles.stockBadge} ${stock <= low ? styles.stockLow : stock === 0 ? styles.stockEmpty : styles.stockOk}`}>
                    {stock}
                  </span>
                );
              },
            },
            {
              header: 'Statut',
              render: (row) => (
                <span className={`${styles.statusBadge} ${row.isActive ? styles.statusActive : styles.statusHidden}`}>
                  {row.isActive ? 'Publié' : 'Masqué'}
                </span>
              ),
            },
            {
              header: 'Actions',
              render: (row) => (
                <div className={styles.actions}>
                  <Link
                    className={styles.editBtn}
                    href={`/admin/produits/${row.id}/modifier`}
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setDeleteId(row.id)}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Supprimer le produit"
        text="Le produit sera masqué de la boutique. Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => void remove()}
        onClose={() => setDeleteId(null)}
      />
    </AdminShell>
  );
}
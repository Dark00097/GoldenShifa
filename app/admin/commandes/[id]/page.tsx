'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { apiFetch, money } from '@/lib/api';
import { adminStatusOptions } from '@/lib/admin';
import { useToast } from '@/lib/toast';
import { Order } from '@/types';
import styles from './page.module.css';

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);

  async function load() {
    const data = await apiFetch<{ order: Order }>(`/admin/orders/${params.id}`);
    setOrder(data.order);
  }

  useEffect(() => {
    load().catch((error) => toast.error(error.message));
  }, [params.id, toast]);

  async function updateStatus(status: string) {
    await apiFetch(`/admin/orders/${params.id}/status`, { method: 'PUT', data: { status } });
    toast.success('Statut mis a jour.');
    await load();
  }

  return (
    <AdminShell title="Detail commande" action={<Link href="/admin/commandes" className={styles.secondaryButton}>Retour</Link>}>
      {!order ? (
        <div className={styles.loadingSurface} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className={styles.mainPanel}>
            <div className="border-b border-amber-100 p-5">
              <h2 className="font-display text-2xl font-bold text-deepHoney">{order.orderNumber}</h2>
              <p className="mt-1 text-sm text-stone-600">{new Date(order.createdAt).toLocaleString('fr-FR')}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-amber-50 text-deepHoney">
                  <tr>
                    <th className="p-3">Produit</th>
                    <th className="p-3">Quantite</th>
                    <th className="p-3">Prix</th>
                    <th className="p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-amber-100">
                      <td className="p-3 font-semibold">{item.name}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{money(item.unitPrice)}</td>
                      <td className="p-3">{money(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <aside className="grid h-fit gap-4">
            <div className={styles.sideCard}>
              <h3 className="font-display text-xl font-bold text-deepHoney">Client</h3>
              <p className="mt-3 text-sm">{order.customerName}</p>
              <p className="text-sm text-stone-600">{order.customerEmail}</p>
              <p className="text-sm text-stone-600">{order.customerPhone || '-'}</p>
            </div>
            <div className={styles.sideCard}>
              <h3 className="font-display text-xl font-bold text-deepHoney">Livraison</h3>
              <p className="mt-3 text-sm">{order.shippingLine1}</p>
              <p className="text-sm text-stone-600">{order.shippingCity}</p>
            </div>
            <div className={styles.sideCard}>
              <h3 className="font-display text-xl font-bold text-deepHoney">Statut</h3>
              <div className="mt-3"><AdminStatusBadge status={order.status} /></div>
              <select className="mt-4" value={order.status} onChange={(event) => void updateStatus(event.target.value)}>
                {adminStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.sideCard}>
              <h3 className="font-display text-xl font-bold text-deepHoney">Totaux</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between"><span>Sous-total</span><strong>{money(order.subtotal)}</strong></div>
                <div className="flex justify-between"><span>Remise</span><strong>-{money(order.discountTotal)}</strong></div>
                <div className="flex justify-between"><span>Livraison</span><strong>{money(order.shippingTotal)}</strong></div>
                <div className="flex justify-between border-t border-amber-100 pt-2 text-base"><span>Total</span><strong>{money(order.total)}</strong></div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}

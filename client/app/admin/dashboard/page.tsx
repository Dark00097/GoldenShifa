// app/admin/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Gift,
  Package,
  PackageCheck,
  Receipt,
  Timer,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { apiFetch, money } from '@/lib/api';
import { statusLabel } from '@/lib/admin';
import { Order, OrderStatus } from '@/types';
import styles from './page.module.css';

type DashboardPayload = {
  stats: {
    commandes: number;
    commandesEnAttente: number;
    commandesAujourdhui: number;
    produits: number;
    produitsActifs: number;
    categories: number;
    coupons: number;
    couponsActifs: number;
    stockFaible: number;
    chiffreAffaires: string | number;
    chiffreAffairesAujourdhui: string | number;
    panierMoyen: string | number;
  };
  recentOrders: Order[];
  salesChart: Array<{ date: string; total: number }>;
  bestSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
  orderStatusBreakdown: Array<{ status: OrderStatus; count: number }>;
  lowStockProducts: Array<{
    id: number;
    sku: string;
    stock: number;
    lowStockAt: number;
    product: { id: number; name: string; slug: string };
  }>;
};

const statusOrder: OrderStatus[] = [
  'PENDING','CONFIRMED','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED',
];

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}
function shortDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short',
  }).format(new Date(value));
}
function fullDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminDashboardPage() {
  const [data, setData]       = useState<DashboardPayload | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch<DashboardPayload>('/admin/dashboard/stats')
      .then(setData)
      .catch((e) => setMessage(e.message));
  }, []);

  const maxChart = useMemo(
    () => Math.max(1, ...(data?.salesChart.map((e) => e.total) || [1])),
    [data],
  );
  const totalStatusCount = useMemo(
    () => data?.orderStatusBreakdown.reduce((s, i) => s + i.count, 0) || 0,
    [data],
  );
  const statusMap = useMemo(
    () => new Map(data?.orderStatusBreakdown.map((i) => [i.status, i.count]) || []),
    [data],
  );
  const maxProductRevenue = useMemo(
    () => Math.max(1, ...(data?.bestSellingProducts.map((p) => p.revenue) || [1])),
    [data],
  );

  const pendingWork =
    (statusMap.get('PENDING') || 0) +
    (statusMap.get('CONFIRMED') || 0) +
    (statusMap.get('PROCESSING') || 0);
  const deliveredRate   = percent(statusMap.get('DELIVERED') || 0, totalStatusCount);
  const activeCatalogRate = percent(
    data?.stats.produitsActifs || 0,
    data?.stats.produits || 0,
  );

  return (
    <AdminShell
      title="Tableau de bord"
      action={
        <Link href="/admin/produits/nouveau" className={styles.primaryAction}>
          <Package size={15} />
          Nouveau produit
        </Link>
      }
    >
      {/* ── Error ── */}
      {message && <p className={styles.errorMessage}>{message}</p>}

      {/* ── Overview banner ── */}
      <section className={styles.overviewBanner}>
        <div className={styles.overviewBannerGlow} />
        <div className={styles.overviewLeft}>
          <p className={styles.overviewKicker}>
            <TrendingUp size={11} />
            Vue d'ensemble
          </p>
          <h2 className={styles.overviewTitle}>Pilotage boutique</h2>
          <p className={styles.overviewText}>
            Suivez les ventes, les commandes à préparer, les alertes de
            stock et les produits qui tirent le plus de revenus.
          </p>
        </div>
        <div className={styles.overviewStats}>
          {[
            { label: "Aujourd'hui",    value: data?.stats.commandesAujourdhui ?? 0,            note: 'commandes reçues', icon: CalendarDays },
            { label: 'Ventes du jour', value: money(data?.stats.chiffreAffairesAujourdhui ?? 0), note: 'chiffre du jour',   icon: Wallet       },
            { label: 'Panier moyen',   value: money(data?.stats.panierMoyen ?? 0),              note: 'par commande',     icon: Receipt      },
            { label: 'Catalogue actif',value: `${activeCatalogRate}%`,                          note: `${data?.stats.produitsActifs ?? 0}/${data?.stats.produits ?? 0} produits`, icon: PackageCheck },
          ].map(({ label, value, note, icon: Icon }) => (
            <div key={label} className={styles.overviewStatCard}>
              <div className={styles.overviewStatCardGlow} />
              <div className={styles.overviewStatIcon}>
                <Icon size={16} />
              </div>
              <p className={styles.overviewStatLabel}>{label}</p>
              <p className={styles.overviewStatValue}>{value}</p>
              <p className={styles.overviewStatNote}>{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KPI row ── */}
      <div className={styles.kpiRow}>
        {[
          { label: "Chiffre d'affaires", value: money(data?.stats.chiffreAffaires ?? 0),  hint: 'Total encaissé',           icon: Wallet  },
          { label: 'Commandes',          value: data?.stats.commandes ?? 0,                hint: `${pendingWork} à traiter`, icon: Receipt },
          { label: 'En attente',         value: data?.stats.commandesEnAttente ?? 0,       hint: 'à confirmer rapidement',   icon: Timer   },
          { label: 'Produits',           value: data?.stats.produits ?? 0,                 hint: `${data?.stats.categories ?? 0} catégories`, icon: Package },
          { label: 'Stock faible',       value: data?.stats.stockFaible ?? 0,              hint: 'réassort prioritaire',     icon: Boxes   },
        ].map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className={styles.kpiCard}>
            <div className={styles.kpiCardGlow} />
            <div className={styles.kpiTop}>
              <span className={styles.kpiIconWrap}>
                <Icon size={16} />
              </span>
              <span className={styles.kpiHint}>{hint}</span>
            </div>
            <p className={styles.kpiLabel}>{label}</p>
            <p className={styles.kpiValue}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Alert cards ── */}
      <div className={styles.alertRow}>
        {[
          {
            title: 'Commandes à traiter',
            value: pendingWork,
            text: 'Priorité aux commandes en attente, confirmées ou en préparation.',
            href: '/admin/commandes',
            icon: ClipboardList,
            accent: styles.alertBlue,
          },
          {
            title: 'Stock à vérifier',
            value: data?.stats.stockFaible ?? 0,
            text: 'Produits sous le seuil minimum de stock.',
            href: '/admin/stock',
            icon: AlertTriangle,
            accent: styles.alertRed,
          },
          {
            title: 'Promotions actives',
            value: data?.stats.couponsActifs ?? 0,
            text: `${data?.stats.coupons ?? 0} coupons créés au total.`,
            href: '/admin/coupons',
            icon: Gift,
            accent: styles.alertGreen,
          },
        ].map(({ title, value, text, href, icon: Icon, accent }) => (
          <Link key={title} href={href} className={`${styles.alertCard} ${accent}`}>
            <div className={styles.alertCardTop}>
              <span className={styles.alertIconWrap}>
                <Icon size={18} />
              </span>
              <ArrowUpRight size={16} className={styles.alertArrow} />
            </div>
            <p className={styles.alertTitle}>{title}</p>
            <p className={styles.alertValue}>{value}</p>
            <p className={styles.alertText}>{text}</p>
          </Link>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className={styles.chartsRow}>

        {/* Sales chart */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <BarChart3 size={18} />
              Graphique des ventes
            </h2>
            <span className={styles.panelBadge}>14 derniers jours</span>
          </div>

          <div className={styles.chartArea}>
            {(data?.salesChart || []).map((entry) => (
              <div key={entry.date} className={styles.chartBar}>
                <span className={styles.chartBarValue}>{money(entry.total)}</span>
                <div
                  className={styles.chartBarFill}
                  style={{ height: `${Math.max(6, (entry.total / maxChart) * 100)}%` }}
                  title={money(entry.total)}
                />
                <span className={styles.chartBarDate}>{shortDate(entry.date)}</span>
              </div>
            ))}
            {!data?.salesChart?.length && (
              <p className={styles.emptyText}>Aucune vente à afficher.</p>
            )}
          </div>
        </section>

        {/* Best sellers */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Meilleures ventes</h2>
            <PackageCheck size={18} className={styles.panelIcon} />
          </div>
          <div className={styles.listGrid}>
            {(data?.bestSellingProducts || []).map((product, i) => (
              <div key={product.name} className={styles.listItem}>
                <div className={styles.listItemTop}>
                  <div>
                    <p className={styles.listItemName}>
                      <span className={styles.listItemRank}>{i + 1}</span>
                      {product.name}
                    </p>
                    <p className={styles.listItemSub}>{product.quantity} vendus</p>
                  </div>
                  <span className={styles.listItemValue}>{money(product.revenue)}</span>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFillGold}
                    style={{ width: `${percent(product.revenue, maxProductRevenue)}%` }}
                  />
                </div>
              </div>
            ))}
            {!data?.bestSellingProducts?.length && (
              <p className={styles.emptyText}>Aucun produit vendu.</p>
            )}
          </div>
        </section>
      </div>

      {/* ── Status + Stock ── */}
      <div className={styles.chartsRow}>

        {/* Order status */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <CheckCircle2 size={18} />
                Statuts des commandes
              </h2>
              <p className={styles.panelSub}>
                {deliveredRate}% livrées sur les commandes suivies.
              </p>
            </div>
          </div>
          <div className={styles.listGrid}>
            {statusOrder.map((status) => {
              const count = statusMap.get(status) || 0;
              return (
                <div key={status} className={styles.statusItem}>
                  <div className={styles.statusItemTop}>
                    <span className={styles.statusItemLabel}>{statusLabel(status)}</span>
                    <span className={styles.statusItemCount}>{count}</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFillAmber}
                      style={{ width: `${percent(count, totalStatusCount)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Low stock */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <AlertTriangle size={18} />
                Alertes stock
              </h2>
              <p className={styles.panelSub}>
                Produits au seuil ou sous le seuil minimum.
              </p>
            </div>
            <Link href="/admin/stock" className={styles.secondaryAction}>
              Stock <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className={styles.listGrid}>
            {(data?.lowStockProducts || []).map((item) => {
              const level = percent(item.stock, Math.max(item.lowStockAt, 1));
              return (
                <div key={item.id} className={styles.listItem}>
                  <div className={styles.listItemTop}>
                    <div>
                      <p className={styles.listItemName}>{item.product.name}</p>
                      <p className={styles.listItemSub}>SKU {item.sku}</p>
                    </div>
                    <span className={styles.stockBadge}>
                      {item.stock}/{item.lowStockAt}
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFillRed}
                      style={{ width: `${Math.min(level, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!data?.lowStockProducts?.length && (
              <p className={styles.emptyText}>Aucune alerte stock.</p>
            )}
          </div>
        </section>
      </div>

      {/* ── Recent orders table ── */}
      <section className={styles.ordersPanel}>
        <div className={styles.ordersPanelHeader}>
          <div>
            <h2 className={styles.panelTitle}>
              <Receipt size={18} />
              Commandes récentes
            </h2>
            <p className={styles.panelSub}>
              Dernières commandes avec statut et montant.
            </p>
          </div>
          <Link href="/admin/commandes" className={styles.secondaryAction}>
            Voir tout <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Commande','Date','Client','Total','Statut'].map((h) => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders || []).map((order) => (
                <tr key={order.id} className={styles.tr}>
                  <td className={`${styles.td} ${styles.tdOrder}`}>
                    {order.orderNumber}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {fullDate(order.createdAt)}
                  </td>
                  <td className={styles.td}>
                    <p className={styles.tdName}>
                      {order.customerName || 'Client invité'}
                    </p>
                    <p className={styles.tdEmail}>{order.customerEmail}</p>
                  </td>
                  <td className={`${styles.td} ${styles.tdPrice}`}>
                    {money(order.total)}
                  </td>
                  <td className={styles.td}>
                    <AdminStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {!data?.recentOrders?.length && (
                <tr>
                  <td className={styles.tdEmpty} colSpan={5}>
                    Aucune commande récente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
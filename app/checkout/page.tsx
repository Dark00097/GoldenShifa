// app/checkout/page.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, Flower2, ShoppingBag } from 'lucide-react';
import { CheckoutForm } from '@/components/CheckoutForm';
import { EmptyState } from '@/components/EmptyState';
import { OrderSummary } from '@/components/OrderSummary';
import { useCart } from '@/lib/cart';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { items, subtotal, discount, deliveryFee, total } = useCart();

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.pageBg} />
        <div className={styles.pageGlow} />
        <div className={`container-page ${styles.emptyWrap}`}>
          <EmptyState
            title="Votre panier est vide"
            text="Ajoutez des produits avant de confirmer une commande."
            actionHref="/produits"
            actionLabel="Voir les produits"
          />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* background layers */}
      <div className={styles.pageBg} />
      <div className={styles.pageGlow} />
      <div className={styles.pagePatternLeft} />
      <div className={styles.pagePatternRight} />

      <div className={`container-page ${styles.inner}`}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.kicker}>
              <ShoppingBag size={12} />
              Finaliser la commande
            </span>
            <h1 className={styles.title}>
              Checkout
              <Flower2
                className={styles.titleIcon}
                size={22}
                aria-hidden="true"
              />
            </h1>
            <p className={styles.headerSub}>
              {items.length} article{items.length !== 1 ? 's' : ''} dans votre panier
            </p>
          </div>

          <Link href="/panier" className={styles.backBtn}>
            <ArrowLeft size={14} />
            Retour au panier
          </Link>
        </div>

        {/* ── Steps indicator ── */}
        <div className={styles.steps}>
          {['Panier', 'Livraison', 'Confirmation'].map((step, i) => (
            <div key={step} className={styles.stepGroup}>
              <div className={`${styles.step} ${i === 1 ? styles.stepActive : i === 0 ? styles.stepDone : styles.stepPending}`}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepLabel}>{step}</span>
              </div>
              {i < 2 && <div className={`${styles.stepLine} ${i === 0 ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className={styles.grid}>
          <CheckoutForm />
          <OrderSummary
            items={items}
            subtotal={subtotal}
            discount={discount}
            deliveryFee={deliveryFee}
            total={total}
          />
        </div>
      </div>
    </main>
  );
}
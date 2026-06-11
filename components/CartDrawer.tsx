'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, ShoppingBag, Trash2, X } from 'lucide-react';
import { assetUrl, money } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { QuantitySelector } from './QuantitySelector';
import styles from './CartDrawer.module.css';

const fallback =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        aria-label="Panier"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient glow */}
        <div className={styles.ambientGlow} />

        {/* ── Header ─────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className={styles.headerTitle}>Mon Panier</h2>
              <p className={styles.headerSub}>
                {items.length === 0
                  ? 'Aucun article'
                  : `${items.length} article${items.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fermer le panier"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Items ──────────────────────────────────────── */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={32} />
              </div>
              <p className={styles.emptyTitle}>Votre panier est vide</p>
              <p className={styles.emptyText}>
                Découvrez nos miels 100% naturels et ajoutez vos favoris.
              </p>
              <Link href="/produits" className={styles.emptyLink} onClick={onClose}>
                Découvrir nos miels
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.product.id} className={styles.itemCard}>
                  {/* Image */}
                  <div className={styles.itemImageWrap}>
                    <Image
                      src={assetUrl(item.product.imageUrl) || fallback}
                      alt={item.product.name}
                      fill
                      className={styles.itemImage}
                    />
                    <div className={styles.itemImageShade} />
                  </div>

                  {/* Info */}
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTop}>
                      <div>
                        {item.product.category?.name && (
                          <span className={styles.itemCategory}>
                            {item.product.category.name}
                          </span>
                        )}
                        <h3 className={styles.itemName}>{item.product.name}</h3>
                        {item.product.weight && (
                          <span className={styles.itemWeight}>{item.product.weight}</span>
                        )}
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.product.id)}
                        aria-label={`Retirer ${item.product.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className={styles.itemBottom}>
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.product.id, value)}
                        compact
                      />
                      <span className={styles.itemPrice}>
                        {money(
                          (parseFloat(item.product.price) * item.quantity).toFixed(2)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        {items.length > 0 && (
          <div className={styles.footer}>
            {/* Divider with honeycomb texture */}
            <div className={styles.footerDivider} />

            {/* Trust strip */}
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                <Leaf size={13} />
                100% Naturel
              </div>
              <div className={styles.trustDot} />
              <div className={styles.trustItem}>
                <ShoppingBag size={13} />
                Paiement sécurisé
              </div>
              <div className={styles.trustDot} />
              <div className={styles.trustItem}>
                <ArrowRight size={13} />
                Livraison rapide
              </div>
            </div>

            {/* Subtotal */}
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Sous-total</span>
              <span className={styles.subtotalValue}>{money(subtotal)}</span>
            </div>

            <p className={styles.shippingNote}>
              Livraison calculée à la commande
            </p>

            {/* CTAs */}
            <div className={styles.ctaStack}>
              <Link
                href="/checkout"
                className={styles.checkoutBtn}
                onClick={onClose}
              >
                Commander maintenant
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/panier"
                className={styles.viewCartBtn}
                onClick={onClose}
              >
                Voir le panier complet
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

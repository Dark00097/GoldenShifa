// components/HomeProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Leaf, Flame } from 'lucide-react';
import { assetUrl, money } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { Product } from '@/types';
import styles from './HomeProductCard.module.css';

const fallback =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80';

export function HomeProductCard({
  product,
  highlighted = false,
}: {
  product: Product;
  highlighted?: boolean;
}) {
  const { addItem } = useCart();
  const toast = useToast();
  const image =
    assetUrl(product.imageUrl || product.images?.[0]?.url) || fallback;
  const discount =
    product.compareAt && Number(product.compareAt) > Number(product.price)
      ? Math.round(
          (1 - Number(product.price) / Number(product.compareAt)) * 100
        )
      : null;

  return (
    <article
      className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}
    >
      {/* ── Background image fills entire card ── */}
      <Link href={`/produits/${product.slug}`} className={styles.imageLink}>
        <Image
          src={image}
          alt={product.name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 50vw, 220px"
        />
      </Link>

      {/* ── Overlays ── */}
      <div className={styles.overlayDark} />
      <div className={styles.overlayGrad} />
      {highlighted && <div className={styles.overlayHighlight} />}

      {/* ── Top badges ── */}
      <div className={styles.topRow}>
        {discount ? (
          <span className={styles.badgeDiscount}>-{discount}%</span>
        ) : product.isFeatured ? (
          <span className={styles.badgeNew}>
            <Leaf size={9} />
            Nouveau
          </span>
        ) : (
          <span />
        )}

        {highlighted && (
          <span className={styles.badgeHot}>
            <Flame size={9} />
            Populaire
          </span>
        )}
      </div>

      {/* ── Bottom content ── */}
      <div className={styles.bottom}>
        {/* stars */}
        <div className={styles.rating}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={10} fill="currentColor" strokeWidth={0} />
          ))}
          <span className={styles.ratingCount}>
            ({product.inventory?.stock ?? 64})
          </span>
        </div>

        {/* name */}
        <Link href={`/produits/${product.slug}`} className={styles.name}>
          {product.name}
        </Link>

        {/* weight tag */}
        {product.weight && (
          <span className={styles.weight}>{product.weight}</span>
        )}

        {/* divider */}
        <div className={styles.divider} />

        {/* buy row */}
        <div className={styles.buyRow}>
          <div className={styles.priceBlock}>
            {product.compareAt && (
              <span className={styles.compareAt}>
                {money(product.compareAt)}
              </span>
            )}
            <strong className={styles.price}>{money(product.price)}</strong>
          </div>

          <button
            type="button"
            aria-label="Ajouter au panier"
            className={styles.cartBtn}
            onClick={() => {
              void addItem(product);
              toast.success('Produit ajouté au panier.');
            }}
          >
            <ShoppingCart size={14} />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* ── Hover shine ── */}
      <div className={styles.shine} />
    </article>
  );
}
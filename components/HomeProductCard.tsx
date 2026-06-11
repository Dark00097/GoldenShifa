// components/HomeProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Leaf, Flame } from 'lucide-react';
import { useMemo, useState } from 'react';
import { assetUrl, money } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { activeVariants, defaultVariant, selectedCompareAt, selectedPrice, selectedWeight } from '@/lib/product';
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
  const variants = useMemo(() => activeVariants(product), [product]);
  const [variantId, setVariantId] = useState<number | null>(defaultVariant(product)?.id ?? null);
  const selectedVariant = variants.find((variant) => variant.id === variantId) || defaultVariant(product);
  const price = selectedPrice(product, selectedVariant);
  const compareAt = selectedCompareAt(product, selectedVariant);
  const weight = selectedWeight(product, selectedVariant);
  const isUnavailable = Boolean(product.isComingSoon);
  const needsWeightSelection = Boolean(product.disableBasePrice && !selectedVariant);
  const image =
    assetUrl(product.imageUrl || product.images?.[0]?.url) || fallback;
  const discount =
    compareAt && Number(compareAt) > Number(price)
      ? Math.round(
          (1 - Number(price) / Number(compareAt)) * 100
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
        {isUnavailable ? (
          <span className={styles.badgeSoon}>Bientôt</span>
        ) : discount ? (
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

        {isUnavailable && (
          <span className={styles.soonText}>Produit sera disponible bientôt</span>
        )}

        {/* weight tag */}
        {weight && (
          <span className={styles.weight}>{weight}</span>
        )}

        {(variants.length > 1 || product.disableBasePrice) && (
          <select
            className={styles.variantSelect}
            value={variantId ?? ''}
            onChange={(event) => setVariantId(event.target.value ? Number(event.target.value) : null)}
            aria-label="Choisir le poids"
          >
            {product.disableBasePrice && <option value="">Choisir un poids</option>}
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.label} - {money(variant.price)}
              </option>
            ))}
          </select>
        )}

        {/* divider */}
        <div className={styles.divider} />

        {/* buy row */}
        <div className={styles.buyRow}>
          <div className={styles.priceBlock}>
            {compareAt && !needsWeightSelection && (
              <span className={styles.compareAt}>
                {money(compareAt)}
              </span>
            )}
            <strong className={styles.price}>{needsWeightSelection ? 'Choisir un poids' : money(price)}</strong>
          </div>

          <button
            type="button"
            aria-label={isUnavailable ? 'Produit bientôt disponible' : needsWeightSelection ? 'Choisir un poids' : 'Ajouter au panier'}
            className={styles.cartBtn}
            disabled={isUnavailable || needsWeightSelection}
            onClick={() => {
              if (isUnavailable || needsWeightSelection) return;
              void addItem(product, 1, selectedVariant);
              toast.success('Produit ajouté au panier.');
            }}
          >
            <ShoppingCart size={14} />
            <span>{isUnavailable ? 'Bientôt' : needsWeightSelection ? 'Poids' : 'Ajouter'}</span>
          </button>
        </div>
      </div>

      {/* ── Hover shine ── */}
      <div className={styles.shine} />
    </article>
  );
}

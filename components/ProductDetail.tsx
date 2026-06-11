'use client';

import Link from 'next/link';
import { ArrowRight, Award, Flower2, Heart, Leaf, ShoppingBag, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { money } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { activeVariants, defaultVariant, selectedCompareAt, selectedPrice, selectedWeight } from '@/lib/product';
import { useToast } from '@/lib/toast';
import { Product } from '@/types';
import { HomeProductCard } from './HomeProductCard';
import { ProductGallery } from './ProductGallery';
import { QuantitySelector } from './QuantitySelector';
import styles from './ProductDetail.module.css';

export function ProductDetail({
  product,
  related = [],
}: {
  product: Product;
  related?: Product[];
}) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const toast = useToast();
  const variants = useMemo(() => activeVariants(product), [product]);
  const [variantId, setVariantId] = useState<number | null>(defaultVariant(product)?.id ?? null);
  const selectedVariant = variants.find((variant) => variant.id === variantId) || defaultVariant(product);
  const price = selectedPrice(product, selectedVariant);
  const compareAt = selectedCompareAt(product, selectedVariant);
  const weight = selectedWeight(product, selectedVariant);
  const stock = product.inventory?.stock ?? 0;
  const isComingSoon = Boolean(product.isComingSoon);
  const needsWeightSelection = Boolean(product.disableBasePrice && !selectedVariant);
  const canOrder = stock > 0 && !isComingSoon && !needsWeightSelection;
  const maxStock = 100;
  const stockPct = Math.min(100, Math.round((stock / maxStock) * 100));
  const isLowStock = stock > 0 && stock <= 10;

  const discount = compareAt
    ? Math.round((1 - parseFloat(price) / parseFloat(compareAt)) * 100)
    : null;

  return (
    <div className={styles.wrapper}>
      {/* ── Hero band ─────────────────────────────────────── */}
      <div className={styles.heroBand}>
        <div className={styles.ambientGlow} />

        <div className={`container-page`}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
            <Link href="/" className={styles.breadcrumbLink}>Accueil</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <Link href="/categories" className={styles.breadcrumbLink}>Catégories</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <Link href={`/categories/${product.category.slug}`} className={styles.breadcrumbLink}>
              {product.category.name}
            </Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{product.name}</span>
          </nav>

          {/* Product grid */}
          <div className={styles.productGrid}>
            {/* Gallery */}
            <div className={styles.galleryCol}>
              <div className={styles.galleryFrame}>
                <ProductGallery product={product} />
              </div>
            </div>

            {/* Info */}
            <div className={styles.infoCol}>
              <Link
                href={`/categories/${product.category.slug}`}
                className={styles.categoryPill}
              >
                <span className={styles.categoryPillDot} />
                {product.category.name}
              </Link>

              <h1 className={styles.productName}>{product.name}</h1>

              {/* Fake rating strip */}
              <div className={styles.ratingStrip}>
                <div className={styles.stars} aria-hidden="true">
                  {'★★★★★'}
                </div>
                <span className={styles.ratingText}>4.9 · +320 avis clients</span>
              </div>

              {/* Price block */}
              <div className={styles.priceBlock}>
                <span className={styles.price}>{needsWeightSelection ? 'Choisir un poids' : money(price)}</span>
                {compareAt && !needsWeightSelection && (
                  <span className={styles.compareAt}>{money(compareAt)}</span>
                )}
                {discount && (
                  <span className={styles.discountBadge}>−{discount}%</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className={styles.description}>{product.description}</p>
              )}

              {(variants.length > 1 || product.disableBasePrice) && (
                <div className={styles.variantSection}>
                  <span className={styles.variantLabel}>Choisir le poids</span>
                  <div className={styles.variantGrid}>
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        className={`${styles.variantButton} ${variant.id === selectedVariant?.id ? styles.variantButtonActive : ''}`}
                        onClick={() => setVariantId(variant.id)}
                      >
                        <span>{variant.label}</span>
                        <strong>{money(variant.price)}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta pills */}
              <div className={styles.metaRow}>
                <div className={styles.metaPill}>
                  <span className={styles.metaPillLabel}>Origine</span>
                  <span className={styles.metaPillValue}>
                    {product.origin || 'Ruchers partenaires'}
                  </span>
                </div>
                <div className={styles.metaPill}>
                  <span className={styles.metaPillLabel}>Format</span>
                  <span className={styles.metaPillValue}>
                    {needsWeightSelection ? 'À choisir' : weight || 'Selon produit'}
                  </span>
                </div>
                <div
                  className={`${styles.metaPill} ${
                    canOrder ? styles.metaPillInStock : styles.metaPillOutOfStock
                  }`}
                >
                  <span className={styles.metaPillLabel}>Disponibilité</span>
                  <span className={styles.metaPillValue}>
                    {isComingSoon ? 'Sera disponible bientôt' : needsWeightSelection ? 'Choisissez un poids' : stock > 0 ? `En stock (${stock})` : 'Rupture de stock'}
                  </span>
                </div>
              </div>

              <hr className={styles.divider} />

              {/* Stock bar */}
              {canOrder && (
                <div className={styles.stockBarWrap}>
                  <div className={styles.stockBarLabel}>
                    <span>Disponibilité</span>
                    <span>{stock} unités restantes</span>
                  </div>
                  <div className={styles.stockBarTrack}>
                    <div
                      className={styles.stockBarFill}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                  {isLowStock && (
                    <p className={styles.lowStockWarning}>
                      ⚡ Presque épuisé — commandez vite !
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={Math.max(1, stock)}
                />
                <button
                  className={styles.addToCartBtn}
                  disabled={!canOrder}
                  onClick={() => {
                    if (!canOrder) return;
                    void addItem(product, quantity, selectedVariant);
                    toast.success('Produit ajouté au panier.');
                  }}
                >
                  <ShoppingBag size={18} />
                  {isComingSoon ? 'Disponible bientôt' : needsWeightSelection ? 'Choisir un poids' : 'Ajouter au panier'}
                </button>
                <button
                  className={styles.wishlistBtn}
                  type="button"
                  aria-label="Ajouter aux favoris"
                >
                  <Heart size={20} />
                </button>
              </div>

              {/* Trust badges */}
              <div className={styles.trustRow}>
                {[
                  { icon: Leaf, text: '100% Naturel' },
                  { icon: Award, text: 'Qualité Premium' },
                  { icon: Truck, text: 'Livraison rapide' },
                ].map(({ icon: Icon, text }) => (
                  <div className={styles.trustItem} key={text}>
                    <Icon size={15} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related products ───────────────────────────────── */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedTexture} />
          <div className="container-page">
            <div className={styles.relatedHeader}>
              <div>
                <p className={styles.relatedKicker}>{product.category.name}</p>
                <h2 className={styles.relatedTitle}>
                  Produits de la même catégorie
                  <Flower2
                    className={styles.relatedTitleIcon}
                    size={22}
                    aria-hidden="true"
                  />
                </h2>
              </div>
              <Link
                href={`/categories/${product.category.slug}`}
                className={styles.relatedLink}
              >
                Voir toute la catégorie
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.relatedGrid}>
              {related.slice(0, 3).map((p) => (
                <HomeProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

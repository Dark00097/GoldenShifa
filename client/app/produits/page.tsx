// app/produits/page.tsx
import type { Metadata } from 'next';
import { Flower2, Leaf, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { HomeProductCard } from '@/components/HomeProductCard';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Produits | GoldenShifa',
  description:
    'Découvrez tous nos miels naturels, propolis, produits de la ruche et coffrets GoldenShifa.'
};

async function getProducts() {
  try {
    const data = await apiFetch<{ products: Product[] }>('/products');
    return data.products;
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />
        <div className={styles.heroGlowBottom} />
        <div className={styles.heroPatternLeft} />
        <div className={styles.heroPatternRight} />

        <div className={`container-page ${styles.heroInner}`}>
          <span className={styles.kicker}>
            <Leaf size={12} />
            Boutique GoldenShifa
          </span>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine1}>Nos</span>
            <span className={styles.heroLine2}>
              Meilleurs
              <span className={styles.heroGold}> Produits</span>
            </span>
          </h1>

          <p className={styles.heroSub}>
            Miels naturels, propolis, produits de la ruche et coffrets
            GoldenShifa — récoltés avec passion, livrés avec soin.
          </p>

          <div className={styles.heroDivider}>
            <span className={styles.dividerLine} />
            <Flower2 size={14} className={styles.dividerIcon} />
            <span className={styles.dividerLine} />
          </div>

          {/* stats row */}
          <div className={styles.heroStats}>
            {[
              { value: products.length || '+20', label: 'Produits' },
              { value: '100%', label: 'Naturel' },
              { value: '+5000', label: 'Clients' },
            ].map(({ value, label }) => (
              <div key={label} className={styles.heroStat}>
                <div className={styles.heroStatGlow} />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.heroFade} />
      </section>

      {/* ── Products grid ── */}
      <section className={styles.gridSection}>
        <div className={styles.gridAmbient} />

        <div className="container-page">

          {/* section header */}
          <div className={styles.gridHeader}>
            <div className={styles.gridHeaderLeft}>
              <span className={styles.gridKicker}>
                <Sparkles size={11} />
                Sélection exclusive
              </span>
              <h2 className={styles.gridTitle}>Tous nos produits</h2>
              <p className={styles.gridSubtitle}>
                Chaque produit est sélectionné pour sa pureté et son
                authenticité.
              </p>
            </div>

            {products.length > 0 && (
              <div className={styles.gridCountCard}>
                <div className={styles.gridCountGlow} />
                <strong>{products.length}</strong>
                <span>produit{products.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* grid or empty */}
          {products.length === 0 ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                title="Aucun produit disponible"
                text="Les produits apparaîtront ici dès que la boutique sera connectée."
              />
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map((product, index) => (
                <HomeProductCard
                  key={product.id}
                  product={product}
                  highlighted={index === 2}
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
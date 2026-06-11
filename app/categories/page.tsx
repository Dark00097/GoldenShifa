// app/categories/page.tsx
import type { Metadata } from 'next';
import { ArrowRight, Flower2, Leaf, Sparkles } from 'lucide-react';
import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/EmptyState';
import { apiFetch } from '@/lib/api';
import { Category } from '@/types';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catégories | GoldenShifa',
  description:
    'Explorez les catégories GoldenShifa : miels premium, produits de la ruche et coffrets cadeaux naturels.'
};

async function getCategories() {
  try {
    const data = await apiFetch<{ categories: Category[] }>('/categories');
    return data.categories;
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className={styles.page}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />
        <div className={styles.heroGlowBottom} />
        <div className={styles.heroPatternLeft} />
        <div className={styles.heroPatternRight} />
        <div className={styles.heroNoise} />

        <div className={`container-page ${styles.heroInner}`}>

          {/* left copy */}
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>
              <Leaf size={12} />
              Catalogue GoldenShifa
            </span>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroLine1}>Explorez</span>
              <span className={styles.heroLine2}>
                Nos
                <span className={styles.heroLineGold}> Catégories</span>
              </span>
            </h1>

            <p className={styles.heroText}>
              Découvrez nos familles de produits naturels sélectionnés avec
              soin — miels monofloraux, coffrets cadeaux et produits de la
              ruche, pour une expérience 100&nbsp;% authentique.
            </p>

            <div className={styles.heroDivider}>
              <span className={styles.heroDividerLine} />
              <Flower2 size={14} className={styles.heroDividerIcon} />
              <span className={styles.heroDividerLine} />
            </div>
          </div>

          {/* right stats */}
          <div className={styles.heroStats}>
            {[
              { value: '+20', label: 'Produits', sub: 'disponibles' },
              { value: '100%', label: 'Naturel', sub: 'garanti' },
              { value: '+5', label: 'Catégories', sub: 'exclusives' },
            ].map(({ value, label, sub }) => (
              <div key={label} className={styles.heroStat}>
                <div className={styles.heroStatGlow} />
                <strong className={styles.heroStatValue}>{value}</strong>
                <span className={styles.heroStatLabel}>{label}</span>
                <span className={styles.heroStatSub}>{sub}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.heroFade} />
      </section>

      {/* ── Grid section ──────────────────────────────────── */}
      <section className={styles.gridSection}>
        <div className={styles.gridAmbient} />

        <div className="container-page">

          {/* header */}
          <div className={styles.gridHeader}>
            <div className={styles.gridHeaderLeft}>
              <span className={styles.gridKicker}>
                <Sparkles size={11} />
                Nos trésors naturels
              </span>
              <h2 className={styles.gridTitle}>Toutes les catégories</h2>
              <p className={styles.gridSubtitle}>
                Chaque catégorie raconte une histoire, chaque miel porte
                l'empreinte de sa terre d'origine.
              </p>
            </div>

            {categories.length > 0 && (
              <div className={styles.gridHeaderRight}>
                <div className={styles.gridCountCard}>
                  <strong>{categories.length}</strong>
                  <span>catégorie{categories.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>

          {/* grid */}
          {categories.length === 0 ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                title="Aucune catégorie disponible"
                text="Les catégories seront visibles dès que la boutique sera connectée."
              />
            </div>
          ) : (
            <div className={styles.grid}>
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className={`${styles.cardWrap} ${
                    index === 0 ? styles.cardWrapFeatured : ''
                  }`}
                >
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA band ──────────────────────────────────────── */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBg} />
        <div className={styles.ctaGlowLeft} />
        <div className={styles.ctaGlowRight} />
        <div className={styles.ctaPatternLeft} />
        <div className={styles.ctaPatternRight} />

        <div className={`container-page ${styles.ctaInner}`}>
          <div className={styles.ctaOrb} />

          <div className={styles.ctaCopy}>
            <span className={styles.ctaKicker}>
              <Flower2 size={12} />
              Prêt à commander ?
            </span>
            <h2 className={styles.ctaTitle}>
              Découvrez nos
              <br />
              <span className={styles.ctaTitleGold}>meilleures sélections</span>
            </h2>
            <p className={styles.ctaText}>
              Des miels d'exception récoltés avec passion, livrés directement chez vous.
            </p>
          </div>

          <div className={styles.ctaActions}>
            <a href="/produits" className={styles.ctaBtn}>
              Voir tous les produits
              <ArrowRight size={16} />
            </a>
            <a href="/notre-histoire" className={styles.ctaBtnOutline}>
              Notre histoire
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <div className={styles.ctaBottomLine} />
      </section>

    </main>
  );
}

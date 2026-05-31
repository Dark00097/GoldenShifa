// app/categories/[slug]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Flower2, Leaf, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { HomeProductCard } from '@/components/HomeProductCard';
import { apiFetch, assetUrl } from '@/lib/api';
import { Category, Product } from '@/types';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

type CategoryResponse = {
  category: Category;
  products: Product[];
};

const fallback =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1200&q=80';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data  = await apiFetch<CategoryResponse>(`/products/category/${slug}`);
    const image = assetUrl(data.category.imageUrl) || fallback;
    return {
      title:       data.category.name,
      description: data.category.description || `Découvrez la catégorie ${data.category.name} sur GoldenShifa.`,
      openGraph: {
        title:       `${data.category.name} | GoldenShifa`,
        description: data.category.description || 'Miels et produits naturels GoldenShifa.',
        images:      [{ url: image }],
      },
    };
  } catch {
    return { title: 'Catégorie introuvable' };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const data  = await apiFetch<CategoryResponse>(`/products/category/${slug}`);
    const image = assetUrl(data.category.imageUrl) || fallback;
    const count = data.products.length;

    return (
      <main className={styles.page}>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          {/* background layers */}
          <div className={styles.heroBg} />
          <div className={styles.heroGlow} />
          <div className={styles.heroPatternLeft} />
          <div className={styles.heroPatternRight} />

          <div className={`container-page ${styles.heroInner}`}>

            {/* breadcrumb */}
            <Link href="/categories" className={styles.breadcrumb}>
              <ArrowLeft size={13} />
              Toutes les catégories
            </Link>

            {/* copy + image */}
            <div className={styles.heroContent}>
              <div className={styles.heroCopy}>
                <span className={styles.kicker}>
                  <Leaf size={12} />
                  Catégorie
                </span>

                <h1 className={styles.heroTitle}>
                  {data.category.name}
                  <Flower2
                    className={styles.heroTitleIcon}
                    size={24}
                    aria-hidden="true"
                  />
                </h1>

                {data.category.description && (
                  <p className={styles.heroDesc}>{data.category.description}</p>
                )}

                <div className={styles.heroDivider}>
                  <span className={styles.dividerLine} />
                  <Flower2 size={12} className={styles.dividerIcon} />
                  <span className={styles.dividerLine} />
                </div>

                {/* count pill */}
                <div className={styles.heroMeta}>
                  <span className={styles.countPill}>
                    {count} produit{count !== 1 ? 's' : ''}
                  </span>
                  <span className={styles.metaDot} />
                  <span className={styles.metaText}>100% Naturel</span>
                </div>
              </div>

              {/* image card */}
              <div className={styles.heroImageWrap}>
                <div className={styles.heroImageInner}>
                  <Image
                    src={image}
                    alt={data.category.name}
                    fill
                    className={styles.heroImage}
                    sizes="(max-width: 768px) 100vw, 480px"
                    priority
                  />
                  {/* overlay */}
                  <div className={styles.heroImageOverlay} />
                </div>
                {/* decorative border glow */}
                <div className={styles.heroImageGlow} />
              </div>
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
                <h2 className={styles.gridTitle}>
                  Produits de cette catégorie
                </h2>
              </div>

              {count > 0 && (
                <div className={styles.gridCountCard}>
                  <div className={styles.gridCountGlow} />
                  <strong>{count}</strong>
                  <span>produit{count !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* empty or grid */}
            {count === 0 ? (
              <div className={styles.emptyWrap}>
                <EmptyState
                  title="Aucun produit dans cette catégorie"
                  text="Cette sélection sera bientôt disponible."
                  actionHref="/produits"
                  actionLabel="Voir tous les produits"
                />
              </div>
            ) : (
              <div className={styles.grid}>
                {data.products.map((product, index) => (
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
  } catch {
    notFound();
  }
}
// components/CategoryCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { assetUrl } from '@/lib/api';
import { Category } from '@/types';
import styles from './CategoryCard.module.css';

const fallback =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80';

export function CategoryCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  const image = assetUrl(category.imageUrl) || fallback;
  const count = category._count?.products ?? 0;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`${styles.card} ${featured ? styles.featured : ''}`}
    >
      {/* image */}
      <Image
        src={image}
        alt={category.name}
        fill
        className={styles.image}
        sizes={
          featured
            ? '(max-width: 768px) 100vw, 66vw'
            : '(max-width: 768px) 100vw, 33vw'
        }
      />

      {/* overlays */}
      <div className={styles.overlayDark} />
      <div className={styles.overlayGrad} />
      <div className={styles.overlayAmber} />

      {/* top badge */}
      <div className={styles.topRow}>
        <span className={styles.badge}>
          <Layers size={10} />
          {count} produit{count !== 1 ? 's' : ''}
        </span>
        {featured && (
          <span className={styles.featuredPill}>Vedette</span>
        )}
      </div>

      {/* bottom content */}
      <div className={styles.bottom}>
        <div className={styles.accentBar} />
        <h3 className={styles.name}>{category.name}</h3>
        {category.description && (
          <p className={styles.desc}>{category.description}</p>
        )}
        <div className={styles.cta}>
          <span className={styles.ctaLabel}>Explorer</span>
          <span className={styles.ctaCircle}>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>

      {/* hover shine */}
      <div className={styles.shine} />
    </Link>
  );
}
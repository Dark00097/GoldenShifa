'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import styles from '@/app/page.module.css';

export type HomeCategoryCard = {
  id: number;
  name: string;
  slug: string;
  href: string;
  image: string;
  productCount: number;
};

type CategoryCarouselProps = {
  categories: HomeCategoryCard[];
};

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    const scrollableWidth = rail.scrollWidth - rail.clientWidth;
    const nextPageCount = scrollableWidth > 1 ? Math.ceil(rail.scrollWidth / rail.clientWidth) : 1;
    const nextActivePage = scrollableWidth > 1 ? Math.round((rail.scrollLeft / scrollableWidth) * (nextPageCount - 1)) : 0;

    setPageCount(nextPageCount);
    setActivePage(Math.min(nextPageCount - 1, Math.max(0, nextActivePage)));
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    measure();
    rail.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      rail.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const scrollToPage = (page: number) => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    const targetPage = Math.min(pageCount - 1, Math.max(0, page));
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const left = pageCount > 1 ? (maxScroll / (pageCount - 1)) * targetPage : 0;

    rail.scrollTo({ left, behavior: 'smooth' });
  };

  return (
    <div className={`container-page ${styles.categoryRailWrap}`}>
      <button
        className={`${styles.roundNav} ${styles.roundNavLeft}`}
        type="button"
        aria-label="Categories precedentes"
        onClick={() => scrollToPage(activePage - 1)}
      >
        <ChevronLeft size={18} />
      </button>
      <div className={styles.categoryRail} ref={railRef}>
        {categories.map((category) => (
          <Link href={category.href} className={styles.categoryCard} key={`${category.id}-${category.slug}`}>
            <Image src={category.image} alt={category.name} fill className={styles.categoryImage} sizes="(max-width: 900px) 45vw, 240px" />
            <div className={styles.categoryOverlay} />
            <div className={styles.categoryBadge}>
              <ShoppingBag size={14} />
            </div>
            <div className={styles.categoryBody}>
              <strong>{category.name}</strong>
              <span>{category.productCount} produits</span>
            </div>
          </Link>
        ))}
      </div>
      <button
        className={`${styles.roundNav} ${styles.roundNavRight}`}
        type="button"
        aria-label="Categories suivantes"
        onClick={() => scrollToPage(activePage + 1)}
      >
        <ChevronRight size={18} />
      </button>
      {pageCount > 1 ? (
        <div className={styles.carouselDots} aria-label="Pagination des categories">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              className={index === activePage ? styles.carouselDotActive : undefined}
              type="button"
              aria-label={`Aller a la page ${index + 1}`}
              aria-current={index === activePage ? 'true' : undefined}
              onClick={() => scrollToPage(index)}
              key={index}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

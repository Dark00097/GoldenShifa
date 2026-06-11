import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Leaf,
  PlayCircle,
  Truck
} from 'lucide-react';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { HomeProductCard } from '@/components/HomeProductCard';
import { apiFetch, assetUrl } from '@/lib/api';
import { Category, Product, StoreSetting } from '@/types';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const uploadedHeroFallback = '/uploads/1778348867545-chatgpt-image-9-mai-2026-18-23-16.png';
const honeyFallback = 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1600&q=90';
const jarFallback = 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=85';
const honeycombFallback = 'https://images.unsplash.com/photo-1577048982768-5cb3e7ddfa24?auto=format&fit=crop&w=900&q=85';

const categoryFallbacks = [
  jarFallback,
  'https://images.unsplash.com/photo-1578922794704-7bdd46f70ce0?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=900&q=85',
  honeycombFallback
];

const fallbackCategories: Category[] = [
  { id: -1, name: 'Miels Monofloraux', slug: 'miels-monofloraux', description: '', imageUrl: categoryFallbacks[0], isActive: true, _count: { products: 6 } },
  { id: -2, name: 'Miels Toutes Fleurs', slug: 'miels-toutes-fleurs', description: '', imageUrl: categoryFallbacks[1], isActive: true, _count: { products: 8 } },
  { id: -3, name: 'Miels Precieux', slug: 'miels-precieux', description: '', imageUrl: categoryFallbacks[2], isActive: true, _count: { products: 4 } },
  { id: -4, name: 'Coffrets Cadeaux', slug: 'coffrets-cadeaux', description: '', imageUrl: categoryFallbacks[3], isActive: true, _count: { products: 5 } },
  { id: -5, name: 'Produits de la Ruche', slug: 'produits-de-la-ruche', description: '', imageUrl: categoryFallbacks[4], isActive: true, _count: { products: 7 } }
];

const fallbackProductCategory = fallbackCategories[0];
const fallbackProducts: Product[] = [
  {
    id: -101,
    name: 'Miel de Thym',
    slug: 'miel-de-thym',
    shortDescription: '',
    description: '',
    price: '26.00',
    compareAt: '30.00',
    imageUrl: jarFallback,
    origin: 'Tunisie',
    weight: '500g',
    isFeatured: true,
    isActive: true,
    categoryId: fallbackProductCategory.id,
    category: fallbackProductCategory,
    inventory: { id: -1, sku: 'FALLBACK-THYM', stock: 128, lowStockAt: 5 }
  },
  {
    id: -102,
    name: "Miel d'Eucalyptus",
    slug: 'miel-eucalyptus',
    shortDescription: '',
    description: '',
    price: '24.00',
    compareAt: null,
    imageUrl: categoryFallbacks[1],
    origin: 'Tunisie',
    weight: '500g',
    isFeatured: true,
    isActive: true,
    categoryId: fallbackProductCategory.id,
    category: fallbackProductCategory,
    inventory: { id: -2, sku: 'FALLBACK-EUCALYPTUS', stock: 96, lowStockAt: 5 }
  },
  {
    id: -103,
    name: 'Miel de Jujubier Royal',
    slug: 'miel-jujubier-royal',
    shortDescription: '',
    description: '',
    price: '35.00',
    compareAt: '39.00',
    imageUrl: categoryFallbacks[2],
    origin: 'Tunisie',
    weight: '500g',
    isFeatured: true,
    isActive: true,
    categoryId: fallbackProductCategory.id,
    category: fallbackProductCategory,
    inventory: { id: -3, sku: 'FALLBACK-JUJUBIER', stock: 75, lowStockAt: 5 }
  },
  {
    id: -104,
    name: "Miel d'Acacia Pur",
    slug: 'miel-acacia-pur',
    shortDescription: '',
    description: '',
    price: '28.00',
    compareAt: '30.00',
    imageUrl: honeyFallback,
    origin: 'Tunisie',
    weight: '500g',
    isFeatured: false,
    isActive: true,
    categoryId: fallbackProductCategory.id,
    category: fallbackProductCategory,
    inventory: { id: -4, sku: 'FALLBACK-ACACIA', stock: 64, lowStockAt: 5 }
  },
  {
    id: -105,
    name: 'Miel de Foret Sauvage',
    slug: 'miel-foret-sauvage',
    shortDescription: '',
    description: '',
    price: '22.00',
    compareAt: null,
    imageUrl: honeycombFallback,
    origin: 'Tunisie',
    weight: '500g',
    isFeatured: false,
    isActive: true,
    categoryId: fallbackProductCategory.id,
    category: fallbackProductCategory,
    inventory: { id: -5, sku: 'FALLBACK-FORET', stock: 64, lowStockAt: 5 }
  }
];

async function getHomeData() {
  try {
    const [productsData, categoriesData, settingsData] = await Promise.all([
      apiFetch<{ products: Product[] }>('/products'),
      apiFetch<{ categories: Category[] }>('/categories'),
      apiFetch<{ settings: StoreSetting }>('/settings')
    ]);

    return {
      products: productsData.products,
      categories: categoriesData.categories,
      settings: settingsData.settings
    };
  } catch {
    return { products: [], categories: [], settings: null };
  }
}

function imageUrl(primary: string | null | undefined, fallback: string) {
  return assetUrl(primary || fallback) || fallback;
}

function categoryImage(category: Category, index: number) {
  return imageUrl(category.imageUrl, categoryFallbacks[index % categoryFallbacks.length]);
}

export default async function HomePage() {
  const { products, categories, settings } = await getHomeData();
  const heroImage = imageUrl(settings?.homeHeroImageUrl, uploadedHeroFallback);
  const storyImage = imageUrl(settings?.homeStoryImageUrl, honeycombFallback);

  const categoryCards = [
    ...categories,
    ...fallbackCategories.filter((fallback) => !categories.some((category) => category.slug === fallback.slug))
  ].slice(0, 5);
  const categoryCarouselItems = categoryCards.map((category, index) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    href: category.id > 0 ? `/categories/${category.slug}` : '/categories',
    image: categoryImage(category, index),
    productCount: category._count?.products ?? 0
  }));
  const productCards = products.length
    ? [...products.filter((product) => product.isFeatured), ...products.filter((product) => !product.isFeatured)].slice(0, 5)
    : fallbackProducts;

  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <Image src={heroImage} alt="Miel naturel Golden Shifa" fill priority className={styles.heroImage} sizes="100vw" />
        <div className={styles.heroShade} />

        <div className={`container-page ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>L'or de la nature,</p>
            <div className={styles.algeriaBadge} aria-label="Algerie">
              <span className={styles.algeriaFlag} aria-hidden="true">
                <svg viewBox="0 0 54 36" focusable="false">
                  <rect width="54" height="36" rx="4" fill="#f8f8f2" />
                  <path d="M0 0h27v36H0z" fill="#006233" />
                  <circle cx="28" cy="18" r="10.5" fill="#d21034" />
                  <circle cx="31.5" cy="18" r="8.5" fill="#f8f8f2" />
                  <path
                    d="M38.5 10.5l1.8 5.5h5.8l-4.7 3.4 1.8 5.6-4.7-3.5-4.7 3.5 1.8-5.6-4.7-3.4h5.8z"
                    fill="#d21034"
                  />
                </svg>
              </span>
              <span>Algerie</span>
            </div>
            <h1>
              La pureté
              <br />
              pour votre
              <br />
              santé.
            </h1>
            <p className={styles.heroText}>
              Découvrez notre sélection exclusive de miels 100% naturels, récoltés avec passion pour vous offrir le meilleur de la ruche.
            </p>
            <div className={styles.heroActions}>
              <Link href="/produits" className={styles.primaryButton}>
                Découvrir nos miels
                <ArrowRight size={16} />
              </Link>
              <Link href="/#histoire" className={styles.videoButton}>
                Voir la vidéo
                <PlayCircle size={18} />
              </Link>
            </div>

            <div className={styles.ratingRow}>
              <div className={styles.avatars} aria-hidden="true">
                <span>AM</span>
                <span>SB</span>
                <span>YK</span>
                <span>LN</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <small>+5000 clients satisfaits</small>
              </div>
            </div>
          </div>
        </div>

        <div className={`container-page ${styles.promiseWrap}`} id="engagements">
          <div className={styles.promiseBar}>
            {[
              { icon: Leaf, title: '100% Naturel', text: 'Sans additifs ni conservateurs' },
              { icon: Flower2, title: 'Récolté avec soin', text: 'Respect des abeilles' },
              { icon: Award, title: 'Qualité Premium', text: 'Miel cru et non pasteurisé' },
              { icon: Truck, title: 'Livraison Rapide', text: 'Partout en Tunisie' }
            ].map(({ icon: Icon, title, text }) => (
              <div className={styles.promiseItem} key={title}>
                <Icon size={32} />
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.categoriesSection}>
        <div className={`container-page ${styles.sectionHeader}`}>
          <div>
            <p>Nos trésors naturels</p>
            <h2>Explorez Nos Catégories</h2>
          </div>
          <Link href="/categories" className={styles.outlineLink}>
            Voir toutes les catégories
            <ArrowRight size={16} />
          </Link>
        </div>

        <CategoryCarousel categories={categoryCarouselItems} />
      </section>

      <section className={styles.selectionSection} id="selection">
        <div className={styles.selectionTexture} />
        <div className={`container-page ${styles.selectionHeader}`}>
          <p>Notre sélection</p>
          <h2>
            Nos Meilleures Sélections
            <Flower2 className={styles.selectionTitleIcon} size={24} aria-hidden="true" />
          </h2>
        </div>

        <div className={styles.productRailWrap}>
          <button className={`${styles.roundNav} ${styles.productNavLeft}`} type="button" aria-label="Produits précédents">
            <ChevronLeft size={18} />
          </button>
          <div className={styles.productRail}>
            {productCards.map((product, index) => (
              <HomeProductCard key={product.id} product={product} highlighted={index === 2} />
            ))}
          </div>
          <button className={`${styles.roundNav} ${styles.productNavRight}`} type="button" aria-label="Produits suivants">
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className={styles.storySection} id="histoire">
        <div className={`container-page ${styles.storyInner}`}>
          <div className={styles.storyCopy}>
            <p>Notre histoire</p>
            <h2>Une histoire de passion et de tradition</h2>
            <span>
              Chez GoldenShifa, nous perpétuons un savoir-faire ancestral en harmonie avec la nature et les abeilles.
            </span>
            <Link href="/#histoire" className={styles.storyButton}>
              Découvrir notre histoire
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className={styles.storyGallery}>
            <div className={styles.storyPhoto}>
              <Image src={storyImage} alt="Histoire Golden Shifa" fill className={styles.storyImage} sizes="(max-width: 980px) 100vw, 680px" />
            </div>
          </div>

          <div className={styles.storyStats}>
            {[
              ['+5 Ans', "D'expertise"],
              ['+5000', 'Clients satisfaits'],
              ['+20', 'Récoltes par an'],
              ['100%', 'Naturel & pur']
            ].map(([value, label]) => (
              <div key={value}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

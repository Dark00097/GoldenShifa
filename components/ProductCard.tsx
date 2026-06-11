'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { assetUrl, money } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { defaultVariant, selectedCompareAt, selectedPrice, selectedWeight } from '@/lib/product';
import { useToast } from '@/lib/toast';
import { Product } from '@/types';

const fallback =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const toast = useToast();
  const image = assetUrl(product.imageUrl || product.images?.[0]?.url) || fallback;
  const variant = defaultVariant(product);
  const price = selectedPrice(product, variant);
  const compareAt = selectedCompareAt(product, variant);
  const weight = selectedWeight(product, variant);
  const isUnavailable = Boolean(product.isComingSoon);
  const needsWeightSelection = Boolean(product.disableBasePrice && !variant);

  return (
    <article className="surface overflow-hidden">
      <Link href={`/produits/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-cream">
          <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">{product.category?.name}</p>
          <Link href={`/produits/${product.slug}`} className="mt-1 block font-display text-xl font-bold text-deepHoney">
            {product.name}
          </Link>
          {weight && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-500">{weight}</p>}
          {isUnavailable && <p className="mt-1 text-xs font-bold uppercase tracking-wide text-deepHoney">Produit sera disponible bientôt</p>}
        </div>
        <p className="line-clamp-2 text-sm text-stone-600">{product.shortDescription || product.description}</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-ink">{needsWeightSelection ? 'Choisir un poids' : money(price)}</span>
            {compareAt && !needsWeightSelection && <span className="ml-2 text-sm text-stone-400 line-through">{money(compareAt)}</span>}
          </div>
          <button
            className="btn-primary px-3"
            disabled={isUnavailable || needsWeightSelection}
            onClick={() => {
              if (isUnavailable || needsWeightSelection) return;
              void addItem(product, 1, variant);
              toast.success('Produit ajouté au panier.');
            }}
            aria-label={isUnavailable ? 'Produit bientôt disponible' : needsWeightSelection ? 'Choisir un poids' : 'Ajouter au panier'}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { assetUrl, money } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { Product } from '@/types';

const fallback =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const toast = useToast();
  const image = assetUrl(product.imageUrl || product.images?.[0]?.url) || fallback;

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
        </div>
        <p className="line-clamp-2 text-sm text-stone-600">{product.shortDescription || product.description}</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-ink">{money(product.price)}</span>
            {product.compareAt && <span className="ml-2 text-sm text-stone-400 line-through">{money(product.compareAt)}</span>}
          </div>
          <button
            className="btn-primary px-3"
            onClick={() => {
              void addItem(product);
              toast.success('Produit ajouté au panier.');
            }}
            aria-label="Ajouter au panier"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

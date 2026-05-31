'use client';

import Image from 'next/image';
import { useState } from 'react';
import { assetUrl } from '@/lib/api';
import { Product } from '@/types';

const fallback =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1200&q=80';

export function ProductGallery({ product }: { product: Product }) {
  const mainImageUrl = product.imageUrl || fallback;
  const galleryImages = product.images?.map((image) => image.url).filter((url) => url && url !== mainImageUrl) || [];
  const images = [mainImageUrl, ...galleryImages];
  const [selected, setSelected] = useState(images[0]);
  const mainImage = assetUrl(selected) || selected || fallback;

  return (
    <div className="grid gap-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-cream shadow-soft">
        <Image src={mainImage} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image) => {
          const src = assetUrl(image) || image || fallback;
          const active = image === selected;
          return (
            <button
              key={image}
              className={`relative aspect-square overflow-hidden rounded-md border bg-white ${
                active ? 'border-deepHoney' : 'border-amber-100'
              }`}
              onClick={() => setSelected(image)}
              aria-label="Voir l'image du produit"
            >
              <Image src={src} alt={product.name} fill className="object-cover" sizes="120px" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDetail } from '@/components/ProductDetail';
import { assetUrl } from '@/lib/api';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await apiFetch<{ product: Product }>(`/products/${slug}`);
    const image = assetUrl(data.product.imageUrl || data.product.images?.[0]?.url) || undefined;
    return {
      title: data.product.name,
      description: data.product.shortDescription || data.product.description.slice(0, 155),
      openGraph: {
        title: `${data.product.name} | GoldenShifa`,
        description: data.product.shortDescription || data.product.description.slice(0, 155),
        images: image ? [{ url: image }] : undefined,
        type: 'website'
      }
    };
  } catch {
    return { title: 'Produit introuvable' };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await apiFetch<{ product: Product }>(`/products/${slug}`);
    let related: Product[] = [];

    try {
      const relatedData = await apiFetch<{ products: Product[] }>(`/products/category/${data.product.category.slug}`);
      related = relatedData.products.filter((product) => product.id !== data.product.id);
    } catch {
      related = [];
    }

    return <ProductDetail product={data.product} related={related} />;
  } catch {
    notFound();
  }
}

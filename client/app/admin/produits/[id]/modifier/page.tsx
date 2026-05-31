'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { ProductForm } from '@/components/admin/ProductForm';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Product } from '@/types';
import styles from './page.module.css';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    apiFetch<{ product: Product }>(`/admin/products/${params.id}`)
      .then((data) => setProduct(data.product))
      .catch((error) => toast.error(error.message));
  }, [params.id, toast]);

  return (
    <AdminShell title="Modifier le produit">
      {product ? <ProductForm product={product} /> : <div className={styles.loadingSurface} />}
    </AdminShell>
  );
}

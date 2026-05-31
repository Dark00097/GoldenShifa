import { AdminShell } from '@/components/AdminShell';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <AdminShell title="Nouveau produit">
      <ProductForm />
    </AdminShell>
  );
}

import { ProductGridSkeleton } from '@/components/LoadingSkeleton';

export default function LoadingPage() {
  return (
    <main className="container-page py-10">
      <div className="mb-8 h-20 max-w-xl animate-pulse rounded-lg bg-amber-100" />
      <ProductGridSkeleton />
    </main>
  );
}

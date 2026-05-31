import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-deepHoney">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1800&q=80')"
        }}
      />
      <div className="container-page relative grid min-h-[620px] items-center py-16">
        <div className="max-w-3xl text-cream">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-pollen">Miels et produits naturels</p>
          <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">Miel naturel premium GoldenShifa</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-amber-50">
            Une selection elegante de miels ambrés, produits de la ruche et coffrets bien-etre pour un quotidien plus naturel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/produits" className="btn-primary bg-pollen text-ink hover:bg-amber-300">
              Découvrir la boutique
              <ArrowRight className="ml-2" size={18} />
            </Link>
            <Link href="/categories/miels-premium" className="btn-secondary border-cream/40 bg-white/10 text-white hover:bg-white/20">
              Miels premium
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

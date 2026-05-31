'use client';

import Link from 'next/link';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-page grid min-h-[70vh] place-items-center py-10">
      <div className="surface max-w-lg p-8 text-center">
        <h1 className="font-display text-3xl font-bold text-deepHoney">Une erreur est survenue</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Veuillez réessayer ou revenir à la boutique.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn-primary" onClick={reset}>Réessayer</button>
          <Link href="/" className="btn-secondary">Accueil</Link>
        </div>
      </div>
    </main>
  );
}

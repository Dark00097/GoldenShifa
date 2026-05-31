import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  title: {
    default: 'GoldenShifa - Miel naturel premium',
    template: '%s | GoldenShifa'
  },
  description: 'Boutique française GoldenShifa pour miel naturel premium, produits de la ruche et coffrets bien-être.',
  openGraph: {
    title: 'GoldenShifa - Miel naturel premium',
    description: 'Miels naturels, produits de la ruche et coffrets bien-être GoldenShifa.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'GoldenShifa'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoldenShifa - Miel naturel premium',
    description: 'Miels naturels, produits de la ruche et coffrets bien-être.'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}

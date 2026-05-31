'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import logoImage from '@/assets/logo.png';
import styles from './MobileNavigation.module.css';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Produits' },
  { href: '/categories', label: 'Catégories' },
  { href: '/#histoire', label: 'À propos' },
  { href: '/#engagements', label: 'Engagements' },
  { href: '/#selection', label: 'Blog' },
  { href: '/#contact', label: 'Contact' }
];

export function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-ink/70 md:hidden ${styles.overlay}`}>
      <nav className={styles.panel}>
        <div className={styles.head}>
          <Link href="/" className={styles.logo} aria-label="Golden Shifa accueil" onClick={onClose}>
            <Image src={logoImage} alt="" className={styles.logoImage} sizes="48px" />
            <span>Golden Shifa</span>
          </Link>
          <button className={styles.close} onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className={styles.links}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={onClose}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

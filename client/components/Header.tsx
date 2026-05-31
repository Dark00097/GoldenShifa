'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown,
  Menu,
  ShoppingCart
} from 'lucide-react';
import logoImage from '@/assets/logo.png';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { CartDrawer } from './CartDrawer';
import { MobileNavigation } from './MobileNavigation';
import styles from './Header.module.css';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Produits', dropdown: true },
  { href: '/categories', label: 'Catégories' },
  { href: '/#histoire', label: 'À propos' },
  { href: '/#engagements', label: 'Nos engagements' },
  { href: '/#selection', label: 'Blog' },
  { href: '/#contact', label: 'Contact' }
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { closeCart, count, drawerOpen, openCart } = useCart();

  function active(href: string) {
    if (href === '/') return pathname === '/';
    if (href.includes('#')) return false;
    return pathname.startsWith(href);
  }

  return (
    <>
      <header className={styles.header}>
        <div className={`container-page ${styles.navbar}`}>
          <Link href="/" className={styles.logo} aria-label="Golden Shifa accueil">
            <Image src={logoImage} alt="" className={styles.logoImage} priority sizes="58px" />
            <span className={styles.logoName}>Golden Shifa</span>
          </Link>

          <nav className={styles.nav} aria-label="Navigation principale">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={active(link.href) ? styles.active : undefined}>
                {link.label}
                {link.dropdown && <ChevronDown size={13} />}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <button className={styles.cartButton} onClick={openCart} type="button" aria-label="Panier">
              <ShoppingCart size={20} />
              <span>{count}</span>
            </button>
            <button className={styles.menuButton} onClick={() => setMenuOpen(true)} type="button" aria-label="Menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>
      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer open={drawerOpen} onClose={closeCart} />
    </>
  );
}

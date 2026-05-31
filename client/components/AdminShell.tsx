// components/AdminShell.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  Tags,
  Ticket,
  X,
  Hexagon,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { AdminProtected } from './admin/AdminProtected';
import styles from './AdminShell.module.css';

const links = [
  { href: '/admin/dashboard',   label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/produits',    label: 'Produits',         icon: Package },
  { href: '/admin/categories',  label: 'Catégories',       icon: Tags },
  { href: '/admin/commandes',   label: 'Commandes',        icon: Receipt },
  { href: '/admin/coupons',     label: 'Coupons',          icon: Ticket },
  { href: '/admin/stock',       label: 'Stock',            icon: Boxes },
  { href: '/admin/parametres',  label: 'Paramètres',       icon: Settings },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  function logout() {
    localStorage.removeItem('goldenshifa_token');
    localStorage.removeItem('goldenshifa_user');
    router.push('/admin/login');
  }

  return (
    <aside className={styles.sidebar}>

      {/* brand */}
      <Link href="/admin/dashboard" className={styles.brand} onClick={onNavigate}>
        <span className={styles.brandIcon}>
          <Hexagon size={18} />
        </span>
        <span className={styles.brandText}>
          Golden<span className={styles.brandGold}>Shifa</span>
          <small>Admin</small>
        </span>
      </Link>

      {/* divider */}
      <div className={styles.brandDivider} />

      {/* nav label */}
      <p className={styles.navLabel}>Navigation</p>

      <nav className={styles.nav}>
        {links.map((link) => {
          const Icon   = link.icon;
          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`) ||
            (pathname === '/admin' && link.href === '/admin/dashboard');

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
            >
              {active && <span className={styles.activeBar} />}
              <span className={styles.navIcon}>
                <Icon size={16} />
              </span>
              <span className={styles.navLinkLabel}>{link.label}</span>
              {active && <span className={styles.activeDot} />}
            </Link>
          );
        })}
      </nav>

      {/* bottom */}
      <div className={styles.sidebarBottom}>
        <div className={styles.sidebarBottomDivider} />
        <button className={styles.logout} onClick={logout}>
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export function AdminShell({
  children,
  title,
  action,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AdminProtected>
      <div className={styles.shell}>

        {/* desktop sidebar */}
        <div className={styles.desktopSidebar}>
          <Sidebar />
        </div>

        {/* mobile overlay */}
        {open && (
          <div
            className={styles.overlay}
            onClick={() => setOpen(false)}
          >
            <div
              className={styles.mobilePanel}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.closeRow}>
                <button
                  className={styles.iconButton}
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                >
                  <X size={16} />
                </button>
              </div>
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        {/* main content column */}
        <div className={styles.contentColumn}>
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <div className={styles.headerLeft}>
                <button
                  className={styles.menuButton}
                  onClick={() => setOpen(true)}
                  aria-label="Menu"
                >
                  <Menu size={17} />
                </button>
                <div className={styles.headerTitleGroup}>
                  <p className={styles.eyebrow}>Administration</p>
                  <h1 className={styles.title}>{title || 'Tableau de bord'}</h1>
                </div>
              </div>
              {action && <div className={styles.headerAction}>{action}</div>}
            </div>
          </header>

          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </AdminProtected>
  );
}
// components/admin/AdminProtected.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Hexagon } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';
import styles from './AdminProtected.module.css';

export function AdminProtected({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('goldenshifa_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    apiFetch<{ user: User }>('/auth/me')
      .then((data) => {
        if (data.user?.role !== 'ADMIN') router.replace('/admin/login');
        else setReady(true);
      })
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  if (!ready) {
    return (
      <div className={styles.page}>
        {/* background layers */}
        <div className={styles.pageBg} />
        <div className={styles.pageGlow} />
        <div className={styles.patternLeft} />
        <div className={styles.patternRight} />

        <div className={styles.card}>
          <div className={styles.cardGlow} />

          {/* brand icon */}
          <div className={styles.iconWrap}>
            <Hexagon size={28} className={styles.iconHex} />
          </div>

          {/* spinner */}
          <div className={styles.spinnerWrap}>
            <div className={styles.spinner} />
          </div>

          {/* text */}
          <p className={styles.title}>Vérification en cours</p>
          <p className={styles.sub}>
            Vérification de la session administrateur…
          </p>

          {/* animated dots */}
          <div className={styles.dots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
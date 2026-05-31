'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { User } from '@/types';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);

    try {
      const data = await apiFetch<{ user: User; token: string }>('/auth/admin/login', {
        method: 'POST',
        data: { email: form.get('email'), password: form.get('password') }
      });
      localStorage.setItem('goldenshifa_token', data.token);
      localStorage.setItem('goldenshifa_user', JSON.stringify(data.user));
      toast.success('Connexion administrateur reussie.');
      router.push('/admin/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <p className={styles.eyebrow}>GoldenShifa</p>
        <h1 className={styles.title}>Connexion admin</h1>
        <div className={styles.fields}>
          <div>
            <label>Email</label>
            <input name="email" type="email" defaultValue="admin@goldenshifa.com" required />
          </div>
          <div>
            <label>Mot de passe</label>
            <input name="password" type="password" defaultValue="Admin123!" required />
          </div>
          <button className={styles.submitButton} disabled={loading}>
            {loading ? 'Connexion...' : 'Connexion'}
          </button>
        </div>
      </form>
    </main>
  );
}

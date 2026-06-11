// components/CheckoutForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  Truck,
  UserRound,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { itemVariant } from '@/lib/product';
import { useToast } from '@/lib/toast';
import styles from './CheckoutForm.module.css';

type CheckoutResponse = { order: { orderNumber: string } };

export function CheckoutForm() {
  const router = useRouter();
  const toast = useToast();
  const { items, couponCode, clearCart, settings } = useCart();
  const [loading,        setLoading]        = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const data = await apiFetch<CheckoutResponse>('/checkout', {
        method: 'POST',
        data: {
          couponCode: couponCode || undefined,
          items: items.map((i) => ({
            productId: i.product.id,
            variantId: itemVariant(i)?.id ?? i.variantId ?? undefined,
            quantity: i.quantity
          })),
          address: {
            fullName:   form.get('fullName'),
            email:      form.get('email'),
            phone:      form.get('phone'),
            line1:      form.get('line1'),
            line2:      form.get('line2'),
            city:       form.get('city'),
            postalCode: form.get('postalCode'),
            country:    form.get('country') || 'Tunisie',
          },
        },
      });
      await clearCart();
      toast.success('Commande confirmee.');
      router.push(`/checkout/success?order=${encodeURIComponent(data.order.orderNumber)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Commande impossible.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Form ── */
  return (
    <form className={styles.form} onSubmit={submit}>

      {/* ── Section: Informations ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><UserRound size={15} /></span>
          <h2 className={styles.sectionTitle}>Informations personnelles</h2>
        </div>

        <div className={styles.sectionBody}>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Nom complet</label>
              <input
                className={styles.input}
                name="fullName"
                placeholder="Ex : Ahmed Ben Ali"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                name="email"
                type="email"
                placeholder="exemple@email.com"
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Téléphone</label>
            <input
              className={styles.input}
              name="phone"
              placeholder="+216 XX XXX XXX"
              required
            />
          </div>
        </div>
      </div>

      {/* ── Section: Adresse ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><MapPin size={15} /></span>
          <h2 className={styles.sectionTitle}>Adresse de livraison</h2>
        </div>

        <div className={styles.sectionBody}>
          <div className={styles.field}>
            <label className={styles.label}>Adresse</label>
            <input
              className={styles.input}
              name="line1"
              placeholder="Rue, numéro…"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Complément d'adresse</label>
            <input
              className={styles.input}
              name="line2"
              placeholder="Appartement, étage… (optionnel)"
            />
          </div>
          <div className={styles.grid3}>
            <div className={styles.field}>
              <label className={styles.label}>Ville</label>
              <input
                className={styles.input}
                name="city"
                placeholder="Ex : Tunis"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Code postal</label>
              <input
                className={styles.input}
                name="postalCode"
                placeholder="1000"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Pays</label>
              <input
                className={styles.input}
                name="country"
                defaultValue="Tunisie"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: Paiement ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><CreditCard size={15} /></span>
          <h2 className={styles.sectionTitle}>Méthode de paiement</h2>
        </div>

        <div className={styles.sectionBody}>
          <div className={styles.paymentBox}>
            <span className={styles.paymentIconWrap}>
              <Truck size={16} />
            </span>
            <div>
              <p className={styles.paymentTitle}>
                {settings?.paymentMethodLabel || 'Paiement à la livraison'}
              </p>
              <p className={styles.paymentSub}>
                Payez en espèces à la réception de votre commande
              </p>
            </div>
            <span className={styles.paymentCheck}>
              <CheckCircle2 size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        className={styles.submitBtn}
        disabled={loading || items.length === 0}
      >
        {loading ? (
          <>
            <span className={styles.submitSpinner} />
            Confirmation en cours…
          </>
        ) : (
          <>
            <CheckCircle2 size={16} />
            Confirmer la commande
          </>
        )}
      </button>
    </form>
  );
}

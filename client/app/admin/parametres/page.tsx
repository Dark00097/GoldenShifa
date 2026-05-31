// app/admin/parametres/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ImagePlus,
  Info,
  LayoutTemplate,
  Save,
  Settings,
  Truck,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { apiFetch, assetUrl, money } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { StoreSetting } from '@/types';
import styles from './page.module.css';

type HomepageImageSlot = 'hero' | 'story';

export default function AdminSettingsPage() {
  const toast = useToast();
  const [settings,     setSettings]     = useState<StoreSetting | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [imageLoading, setImageLoading] = useState<HomepageImageSlot | null>(null);
  const [imageFiles,   setImageFiles]   = useState<Record<string, File | null>>({});

  useEffect(() => {
    apiFetch<{ settings: StoreSetting }>('/admin/settings')
      .then((d) => setSettings(d.settings))
      .catch((e) => toast.error(e.message));
  }, [toast]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const data = await apiFetch<{ settings: StoreSetting }>('/admin/settings', {
        method: 'PUT',
        data: {
          deliveryFee:  form.get('deliveryFee'),
          freeDelivery: form.get('freeDelivery') === 'on',
        },
      });
      setSettings(data.settings);
      toast.success('Paramètres mis à jour.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible.');
    } finally {
      setLoading(false);
    }
  }

  async function uploadHomepageImage(
    e: FormEvent<HTMLFormElement>,
    slot: HomepageImageSlot,
  ) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form   = new FormData(formEl);
    const image  = form.get('image');

    if (!(image instanceof File) || image.size === 0) {
      toast.error('Choisissez une image.');
      return;
    }

    const fd = new FormData();
    fd.append('image', image);
    setImageLoading(slot);

    try {
      const data = await apiFetch<{ settings: StoreSetting }>(
        `/admin/settings/homepage-images/${slot}`,
        { method: 'POST', data: fd },
      );
      setSettings(data.settings);
      formEl.reset();
      setImageFiles((prev) => ({ ...prev, [slot]: null }));
      toast.success(slot === 'hero' ? 'Image hero mise à jour.' : 'Image histoire mise à jour.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image impossible à enregistrer.');
    } finally {
      setImageLoading(null);
    }
  }

  return (
    <AdminShell title="Paramètres">

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderGlow} />
        <div className={styles.pageHeaderLeft}>
          <span className={styles.pageHeaderIcon}>
            <Settings size={18} />
          </span>
          <div>
            <h2 className={styles.pageHeaderTitle}>Paramètres de la boutique</h2>
            <p className={styles.pageHeaderSub}>
              Livraison, images et configuration générale
            </p>
          </div>
        </div>
      </div>

      <div className={styles.layout}>

        {/* ══ Delivery settings ══ */}
        <section className={styles.panel}>
          <div className={styles.panelGlow} />

          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}><Truck size={15} /></span>
            <h3 className={styles.panelTitle}>Livraison & paiement</h3>
          </div>

          <form
            key={settings ? `${settings.deliveryFee}-${settings.freeDelivery}` : 'loading'}
            className={styles.form}
            onSubmit={submit}
          >
            {/* payment method — read only */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Mode de paiement</label>
              <div className={styles.paymentBox}>
                <Truck size={14} className={styles.paymentIcon} />
                <div>
                  <span className={styles.paymentTitle}>Paiement à la livraison</span>
                  <span className={styles.paymentSub}>Seul mode disponible actuellement</span>
                </div>
              </div>
            </div>

            {/* delivery fee */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Frais de livraison (TND)</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputPrefix}>TND</span>
                <input
                  className={styles.input}
                  name="deliveryFee"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={settings?.deliveryFee ?? '7.00'}
                  required
                />
              </div>
              <p className={styles.hint}>
                <Info size={11} />
                Valeur actuelle&nbsp;: <strong>{money(settings?.deliveryFee ?? 7)}</strong>
              </p>
            </div>

            {/* free delivery checkbox */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Option livraison</label>
              <label className={styles.checkboxLabel}>
                <input
                  className={styles.checkboxNative}
                  name="freeDelivery"
                  type="checkbox"
                  defaultChecked={settings?.freeDelivery ?? false}
                />
                <span className={styles.checkboxBox} />
                <span className={styles.checkboxText}>
                  Livraison gratuite
                  <small>Désactive les frais de livraison pour tous les clients</small>
                </span>
              </label>
            </div>

            <div className={styles.formFooter}>
              <button
                className={styles.submitBtn}
                disabled={loading}
              >
                <Save size={14} />
                {loading ? 'Enregistrement…' : 'Enregistrer les paramètres'}
              </button>
            </div>
          </form>
        </section>

        {/* ══ Homepage images ══ */}
        <section className={styles.panel}>
          <div className={styles.panelGlow} />

          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}><LayoutTemplate size={15} /></span>
            <div>
              <h3 className={styles.panelTitle}>Images de la page d'accueil</h3>
              <p className={styles.panelSub}>
                Ces images alimentent le grand hero et le visuel histoire de la page d'accueil.
              </p>
            </div>
          </div>

          <div className={styles.imageForms}>
            {[
              {
                slot:    'hero'  as const,
                title:   'Image hero',
                text:    'Visuel principal affiché en haut de la page d\'accueil.',
                current: settings?.homeHeroImageUrl,
              },
              {
                slot:    'story' as const,
                title:   'Image histoire',
                text:    'Grand visuel utilisé dans la section Notre Histoire.',
                current: settings?.homeStoryImageUrl,
              },
            ].map((item) => {
              const preview = assetUrl(item.current);
              const file    = imageFiles[item.slot];
              return (
                <form
                  key={item.slot}
                  className={styles.imageForm}
                  onSubmit={(e) => void uploadHomepageImage(e, item.slot)}
                >
                  {/* preview */}
                  <div className={styles.previewWrap}>
                    {preview ? (
                      <Image
                        src={preview}
                        alt={item.title}
                        fill
                        className={styles.previewImg}
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                    ) : (
                      <div className={styles.previewEmpty}>
                        <ImagePlus size={24} />
                        <span>Aucune image</span>
                      </div>
                    )}
                    {/* overlay badge */}
                    <span className={styles.previewBadge}>{item.title}</span>
                  </div>

                  {/* controls */}
                  <div className={styles.imageControls}>
                    <p className={styles.imageDesc}>{item.text}</p>

                    <label className={styles.fileLabel}>
                      <input
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className={styles.fileInput}
                        onChange={(e) =>
                          setImageFiles((prev) => ({
                            ...prev,
                            [item.slot]: e.target.files?.[0] || null,
                          }))
                        }
                      />
                      <ImagePlus size={13} />
                      {file ? file.name : 'Choisir une image…'}
                    </label>

                    <button
                      className={styles.uploadBtn}
                      disabled={imageLoading === item.slot}
                    >
                      <Save size={13} />
                      {imageLoading === item.slot ? 'Envoi en cours…' : 'Mettre à jour'}
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
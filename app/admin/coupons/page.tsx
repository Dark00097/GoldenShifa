// app/admin/coupons/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  Edit,
  Gift,
  Percent,
  Plus,
  Save,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable } from '@/components/admin/AdminTable';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Coupon } from '@/types';
import styles from './page.module.css';

export default function AdminCouponsPage() {
  const toast = useToast();
  const [coupons,  setCoupons]  = useState<Coupon[]>([]);
  const [editing,  setEditing]  = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    const data = await apiFetch<{ coupons: Coupon[] }>('/admin/coupons');
    setCoupons(data.coupons);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, [toast]);

  function cancelEdit() {
    setEditing(null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl  = e.currentTarget;
    const form    = new FormData(formEl);
    const payload = {
      code:          form.get('code'),
      description:   form.get('description') || null,
      discountType:  form.get('discountType'),
      value:         form.get('value'),
      minimumAmount: form.get('minimumAmount') || null,
      usageLimit:    form.get('usageLimit') || null,
      expiresAt:     form.get('expiresAt') || null,
      isActive:      form.get('isActive') === 'on',
    };

    if (editing)
      await apiFetch(`/admin/coupons/${editing.id}`, { method: 'PUT',  data: payload });
    else
      await apiFetch('/admin/coupons',               { method: 'POST', data: payload });

    toast.success(editing ? 'Coupon mis à jour.' : 'Coupon créé.');
    cancelEdit();
    formEl.reset();
    await load();
  }

  async function remove() {
    if (!deleteId) return;
    await apiFetch(`/admin/coupons/${deleteId}`, { method: 'DELETE' });
    toast.success('Coupon supprimé.');
    setDeleteId(null);
    await load();
  }

  const activeCoupons   = coupons.filter((c) => c.isActive).length;
  const expiredCoupons  = coupons.filter(
    (c) => c.expiresAt && new Date(c.expiresAt) < new Date()
  ).length;

  return (
    <AdminShell title="Coupons">

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderGlow} />
        <div className={styles.pageHeaderLeft}>
          <span className={styles.pageHeaderIcon}>
            <Ticket size={18} />
          </span>
          <div>
            <h2 className={styles.pageHeaderTitle}>Gestion des coupons</h2>
            <p className={styles.pageHeaderSub}>
              {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        {/* stat pills */}
        <div className={styles.pageHeaderStats}>
          {[
            { label: 'Actifs',   count: activeCoupons,              cls: styles.statPillGreen },
            { label: 'Expirés',  count: expiredCoupons,             cls: styles.statPillRed   },
            { label: 'Total',    count: coupons.length,             cls: styles.statPillAmber },
          ].map(({ label, count, cls }) => (
            <div key={label} className={`${styles.statPill} ${cls}`}>
              <strong>{count}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className={styles.formPanel}>
        <div className={styles.formPanelGlow} />

        <div className={styles.formHeader}>
          <div className={styles.formHeaderLeft}>
            <span className={styles.formHeaderIcon}>
              {editing ? <Edit size={14} /> : <Plus size={14} />}
            </span>
            <h3 className={styles.formHeaderTitle}>
              {editing ? `Modifier : ${editing.code}` : 'Nouveau coupon'}
            </h3>
          </div>
          {editing && (
            <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>
              <X size={14} />
              Annuler
            </button>
          )}
        </div>

        <form key={editing?.id ?? 'new'} className={styles.form} onSubmit={submit}>

          {/* row 1 */}
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Code promo</label>
              <div className={styles.codeInputWrap}>
                <Gift size={13} className={styles.codeIcon} />
                <input
                  className={`${styles.input} ${styles.inputWithIcon} ${styles.inputCode}`}
                  name="code"
                  placeholder="Ex : SUMMER20"
                  defaultValue={editing?.code || ''}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Type de remise</label>
              <select
                className={styles.select}
                name="discountType"
                defaultValue={editing?.discountType || 'PERCENTAGE'}
              >
                <option value="PERCENTAGE">Pourcentage (%)</option>
                <option value="FIXED">Montant fixe (TND)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Valeur</label>
              <div className={styles.inputWrap}>
                <Percent size={12} className={styles.inputPrefix} />
                <input
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  name="value"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  defaultValue={editing?.value || ''}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Montant minimum</label>
              <input
                className={styles.input}
                name="minimumAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={editing?.minimumAmount || ''}
              />
            </div>
          </div>

          {/* row 2 */}
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Limite d'utilisation</label>
              <input
                className={styles.input}
                name="usageLimit"
                type="number"
                placeholder="Illimitée"
                defaultValue={editing?.usageLimit || ''}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Expiration</label>
              <input
                className={`${styles.input} ${styles.inputDate}`}
                name="expiresAt"
                type="date"
                defaultValue={editing?.expiresAt?.slice(0, 10) || ''}
              />
            </div>

            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label className={styles.fieldLabel}>Description</label>
              <input
                className={styles.input}
                name="description"
                placeholder="Note interne…"
                defaultValue={editing?.description || ''}
              />
            </div>
          </div>

          {/* bottom row */}
          <div className={styles.formBottom}>
            <label className={styles.checkboxLabel}>
              <input
                className={styles.checkboxNative}
                name="isActive"
                type="checkbox"
                defaultChecked={editing?.isActive ?? true}
              />
              <span className={styles.checkboxBox} />
              <span className={styles.checkboxText}>
                Actif
                <small>Utilisable en boutique</small>
              </span>
            </label>

            <button className={styles.submitBtn}>
              <Save size={14} />
              {editing ? 'Mettre à jour' : 'Créer le coupon'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <AdminTable
          rows={coupons}
          searchPlaceholder="Rechercher un coupon…"
          columns={[
            {
              header: 'Code',
              searchValue: (row) => row.code,
              render: (row) => (
                <span className={styles.codeText}>{row.code}</span>
              ),
            },
            {
              header: 'Type',
              render: (row) => (
                <span className={styles.typePill}>
                  {row.discountType === 'PERCENTAGE' ? '% Remise' : 'Fixe TND'}
                </span>
              ),
            },
            {
              header: 'Valeur',
              render: (row) => (
                <span className={styles.valueText}>
                  {row.discountType === 'PERCENTAGE'
                    ? `${row.value}%`
                    : `${row.value} TND`}
                </span>
              ),
            },
            {
              header: 'Expiration',
              render: (row) => {
                if (!row.expiresAt) return <span className={styles.dimText}>—</span>;
                const expired = new Date(row.expiresAt) < new Date();
                return (
                  <span className={expired ? styles.expiredText : styles.dateText}>
                    {new Date(row.expiresAt).toLocaleDateString('fr-FR')}
                  </span>
                );
              },
            },
            {
              header: 'Utilisation',
              render: (row) => (
                <span className={styles.usageBadge}>
                  {row.usedCount || 0}
                  <span className={styles.usageSep}>/</span>
                  {row.usageLimit || '∞'}
                </span>
              ),
            },
            {
              header: 'Statut',
              render: (row) => (
                <span className={`${styles.statusBadge} ${row.isActive ? styles.statusActive : styles.statusOff}`}>
                  <span className={styles.statusDot} />
                  {row.isActive ? 'Actif' : 'Inactif'}
                </span>
              ),
            },
            {
              header: 'Actions',
              render: (row) => (
                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => setEditing(row)}
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setDeleteId(row.id)}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Supprimer le coupon"
        text="Le coupon sera désactivé et ne pourra plus être utilisé."
        confirmLabel="Supprimer"
        onConfirm={() => void remove()}
        onClose={() => setDeleteId(null)}
      />
    </AdminShell>
  );
}
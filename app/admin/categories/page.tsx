// app/admin/categories/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Edit,
  FolderOpen,
  ImagePlus,
  Info,
  Plus,
  Save,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable } from '@/components/admin/AdminTable';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { apiFetch, assetUrl } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Category } from '@/types';
import styles from './page.module.css';

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [deleteId,   setDeleteId]   = useState<number | null>(null);
  const [imageFile,  setImageFile]  = useState<File | null>(null);

  async function load() {
    const data = await apiFetch<{ categories: Category[] }>('/admin/categories');
    setCategories(data.categories);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, [toast]);

  function cancelEdit() {
    setEditing(null);
    setImageFile(null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form   = new FormData(formEl);

    const payload = {
      name:        form.get('name'),
      description: form.get('description'),
      imageUrl:    editing?.imageUrl || null,
      isActive:    form.get('isActive') === 'on',
    };

    const saved = editing
      ? await apiFetch<{ category: Category }>(`/admin/categories/${editing.id}`, { method: 'PUT',  data: payload })
      : await apiFetch<{ category: Category }>('/admin/categories',               { method: 'POST', data: payload });

    const image = form.get('image');
    if (image instanceof File && image.size > 0) {
      const fd = new FormData();
      fd.append('image', image);
      await apiFetch(`/admin/categories/${saved.category.id}/image`, { method: 'POST', data: fd });
    }

    toast.success(editing ? 'Catégorie mise à jour.' : 'Catégorie créée.');
    cancelEdit();
    formEl.reset();
    await load();
  }

  async function remove() {
    if (!deleteId) return;
    await apiFetch(`/admin/categories/${deleteId}`, { method: 'DELETE' });
    toast.success('Catégorie supprimée.');
    setDeleteId(null);
    await load();
  }

  return (
    <AdminShell title="Catégories">

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderGlow} />
        <div className={styles.pageHeaderLeft}>
          <span className={styles.pageHeaderIcon}>
            <Tags size={18} />
          </span>
          <div>
            <h2 className={styles.pageHeaderTitle}>Gestion des catégories</h2>
            <p className={styles.pageHeaderSub}>
              {categories.length} catégorie{categories.length !== 1 ? 's' : ''} dans le catalogue
            </p>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className={styles.formPanel}>
        <div className={styles.formPanelGlow} />

        <div className={styles.formHeader}>
          <div className={styles.formHeaderLeft}>
            <span className={styles.formHeaderIcon}>
              {editing ? <Edit size={14} /> : <Plus size={14} />}
            </span>
            <h3 className={styles.formHeaderTitle}>
              {editing ? `Modifier : ${editing.name}` : 'Nouvelle catégorie'}
            </h3>
          </div>
          {editing && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={cancelEdit}
            >
              <X size={14} />
              Annuler
            </button>
          )}
        </div>

        <form
          key={editing?.id ?? 'new'}
          className={styles.form}
          onSubmit={submit}
        >
          {/* image column */}
          <div className={styles.imageCol}>
            <span className={styles.fieldLabel}>Image</span>

            {editing?.imageUrl ? (
              <div className={styles.imagePreview}>
                <Image
                  src={assetUrl(editing.imageUrl) || editing.imageUrl}
                  alt={editing.name}
                  fill
                  className={styles.previewImg}
                  sizes="160px"
                />
              </div>
            ) : (
              <div className={styles.imagePreviewEmpty}>
                <FolderOpen size={22} />
                <span>Aucune image</span>
              </div>
            )}

            <label className={styles.fileLabel}>
              <input
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={styles.fileInput}
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <ImagePlus size={13} />
              {imageFile ? imageFile.name : 'Choisir…'}
            </label>
          </div>

          {/* fields column */}
          <div className={styles.fieldsCol}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Nom de la catégorie</label>
              <input
                className={styles.input}
                name="name"
                placeholder="Ex : Miels Monofloraux"
                defaultValue={editing?.name || ''}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Description</label>
              <input
                className={styles.input}
                name="description"
                placeholder="Courte description…"
                defaultValue={editing?.description || ''}
              />
            </div>

            <div className={styles.formBottom}>
              {/* active checkbox */}
              <label className={styles.checkboxLabel}>
                <input
                  className={styles.checkboxNative}
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editing?.isActive ?? true}
                />
                <span className={styles.checkboxBox} />
                <span className={styles.checkboxText}>
                  Active
                  <small>Visible dans la boutique</small>
                </span>
              </label>

              {/* submit */}
              <button className={styles.submitBtn}>
                <Save size={14} />
                {editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <AdminTable
          rows={categories}
          searchPlaceholder="Rechercher une catégorie…"
          columns={[
            {
              header: 'Image',
              render: (row) => {
                const src = assetUrl(row.imageUrl);
                return src ? (
                  <div className={styles.tableImage}>
                    <Image
                      src={src}
                      alt={row.name}
                      fill
                      className={styles.tableImg}
                      sizes="56px"
                    />
                  </div>
                ) : (
                  <div className={styles.tableImageEmpty}>
                    <FolderOpen size={14} />
                  </div>
                );
              },
            },
            {
              header: 'Nom',
              searchValue: (row) => row.name,
              render: (row) => (
                <span className={styles.categoryName}>{row.name}</span>
              ),
            },
            {
              header: 'Description',
              searchValue: (row) => row.description || '',
              render: (row) =>
                row.description ? (
                  <span className={styles.descText}>{row.description}</span>
                ) : (
                  <span className={styles.dimText}>—</span>
                ),
            },
            {
              header: 'Produits',
              render: (row) => (
                <span className={styles.countBadge}>
                  {row._count?.products ?? 0}
                </span>
              ),
            },
            {
              header: 'Statut',
              render: (row) => (
                <span className={`${styles.statusBadge} ${row.isActive ? styles.statusActive : styles.statusOff}`}>
                  {row.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              header: 'Actions',
              render: (row) => (
                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => { setEditing(row); setImageFile(null); }}
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
        title="Supprimer la catégorie"
        text="La catégorie sera désactivée et masquée de la boutique."
        confirmLabel="Supprimer"
        onConfirm={() => void remove()}
        onClose={() => setDeleteId(null)}
      />
    </AdminShell>
  );
}
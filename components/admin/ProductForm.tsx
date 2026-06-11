// components/ProductForm.tsx
'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ImagePlus,
  Images,
  Info,
  Layers,
  Package,
  Save,
  Tag,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { apiFetch, assetUrl } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Category, Product } from '@/types';
import styles from './ProductForm.module.css';

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const toast  = useToast();

  const [categories,     setCategories]     = useState<Category[]>([]);
  const [categoryId,     setCategoryId]     = useState(product?.categoryId ? String(product.categoryId) : '');
  const [galleryProduct, setGalleryProduct] = useState<Product | undefined>(product);
  const [mainImageFile,  setMainImageFile]  = useState<File | null>(null);
  const [galleryFiles,   setGalleryFiles]   = useState<FileList | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [imageActionId,  setImageActionId]  = useState<number | null>(null);

  const galleryImages = useMemo(() => {
    const main = galleryProduct?.imageUrl || '';
    return galleryProduct?.images?.filter((img) => img.url !== main) || [];
  }, [galleryProduct]);

  const selectedGalleryCount = galleryFiles?.length || 0;
  const galleryLimitExceeded = galleryImages.length + selectedGalleryCount > 10;

  useEffect(() => {
    apiFetch<{ categories: Category[] }>('/admin/categories')
      .then((d) => setCategories(d.categories))
      .catch(() => toast.error('Chargement des catégories impossible.'));
  }, [toast]);

  useEffect(() => {
    setGalleryProduct(product);
    setCategoryId(product?.categoryId ? String(product.categoryId) : '');
  }, [product]);

  async function uploadMainImage(productId: number) {
    if (!mainImageFile) return;
    const fd = new FormData();
    fd.append('image', mainImageFile);
    await apiFetch(`/admin/products/${productId}/main-image`, { method: 'POST', data: fd });
  }

  async function uploadGalleryImages(productId: number) {
    if (!galleryFiles?.length) return;
    const fd = new FormData();
    Array.from(galleryFiles).forEach((f) => fd.append('images', f));
    await apiFetch(`/admin/products/${productId}/images`, { method: 'POST', data: fd });
  }

  async function deleteImage(imageId: number) {
    if (!product) return;
    setImageActionId(imageId);
    try {
      const data = await apiFetch<{ product: Product }>(
        `/admin/products/${product.id}/images/${imageId}`,
        { method: 'DELETE' },
      );
      setGalleryProduct(data.product);
      toast.success('Image supprimée.');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Suppression impossible.');
    } finally {
      setImageActionId(null);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (galleryLimitExceeded) {
      toast.error('La galerie ne peut pas dépasser 10 images.');
      return;
    }
    const form    = new FormData(e.currentTarget);
    const payload = {
      name:             form.get('name'),
      shortDescription: form.get('shortDescription') || null,
      description:      form.get('description'),
      price:            form.get('price'),
      compareAt:        form.get('compareAt') || null,
      origin:           form.get('origin') || null,
      weight:           form.get('weight') || null,
      categoryId,
      sku:              form.get('sku') || undefined,
      stock:            form.get('stock') || 0,
      lowStockAt:       form.get('lowStockAt') || 5,
      isFeatured:       form.get('isFeatured') === 'on',
      isActive:         form.get('isActive') === 'on',
    };
    setLoading(true);
    try {
      const res = product
        ? await apiFetch<{ product: Product }>(`/admin/products/${product.id}`, { method: 'PUT',  data: payload })
        : await apiFetch<{ product: Product }>('/admin/products',               { method: 'POST', data: payload });
      await uploadMainImage(res.product.id);
      await uploadGalleryImages(res.product.id);
      toast.success(product ? 'Produit mis à jour.' : 'Produit créé.');
      router.refresh();
      router.push('/admin/produits');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>

      {/* ══ Section: Informations générales ══ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><Package size={15} /></span>
          <h3 className={styles.sectionTitle}>Informations générales</h3>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>Nom du produit</label>
            <input
              className={styles.input}
              name="name"
              defaultValue={product?.name}
              placeholder="Ex : Miel de Thym"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Catégorie</label>
            <select
              className={styles.select}
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Choisir une catégorie…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description courte</label>
          <input
            className={styles.input}
            name="shortDescription"
            defaultValue={product?.shortDescription || ''}
            placeholder="Résumé en une ligne…"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description complète</label>
          <textarea
            className={styles.textarea}
            name="description"
            rows={5}
            defaultValue={product?.description}
            placeholder="Description détaillée du produit…"
            required
          />
        </div>
      </div>

      {/* ══ Section: Prix & Stock ══ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><Tag size={15} /></span>
          <h3 className={styles.sectionTitle}>Prix & Stock</h3>
        </div>

        <div className={styles.grid4}>
          <div className={styles.field}>
            <label className={styles.label}>Prix (TND)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputPrefix}>TND</span>
              <input
                className={`${styles.input} ${styles.inputWithPrefix}`}
                name="price"
                type="number"
                step="0.01"
                defaultValue={product?.price}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Prix barré</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputPrefix}>TND</span>
              <input
                className={`${styles.input} ${styles.inputWithPrefix}`}
                name="compareAt"
                type="number"
                step="0.01"
                defaultValue={product?.compareAt || ''}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Stock</label>
            <input
              className={styles.input}
              name="stock"
              type="number"
              defaultValue={product?.inventory?.stock ?? 0}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Alerte stock</label>
            <input
              className={styles.input}
              name="lowStockAt"
              type="number"
              defaultValue={product?.inventory?.lowStockAt ?? 5}
            />
          </div>
        </div>
      </div>

      {/* ══ Section: Références ══ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><Layers size={15} /></span>
          <h3 className={styles.sectionTitle}>Références produit</h3>
        </div>

        <div className={styles.grid3}>
          <div className={styles.field}>
            <label className={styles.label}>SKU</label>
            <input
              className={styles.input}
              name="sku"
              defaultValue={product?.inventory?.sku || ''}
              placeholder="Ex : MIEL-THY-500"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Origine</label>
            <input
              className={styles.input}
              name="origin"
              defaultValue={product?.origin || ''}
              placeholder="Ex : Tunisie"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Format / Poids</label>
            <input
              className={styles.input}
              name="weight"
              defaultValue={product?.weight || ''}
              placeholder="Ex : 500g"
            />
          </div>
        </div>
      </div>

      {/* ══ Section: Image principale ══ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><ImagePlus size={15} /></span>
          <h3 className={styles.sectionTitle}>Image principale</h3>
        </div>

        <div className={styles.imageMainRow}>
          {/* preview */}
          {galleryProduct?.imageUrl ? (
            <div className={styles.imagePreview}>
              <Image
                src={assetUrl(galleryProduct.imageUrl) || galleryProduct.imageUrl}
                alt={galleryProduct.name}
                fill
                className={styles.imagePreviewImg}
                sizes="160px"
              />
            </div>
          ) : (
            <div className={styles.imagePreviewEmpty}>
              <ImagePlus size={24} />
              <span>Aucune image</span>
            </div>
          )}

          <div className={styles.imageMainInfo}>
            <label className={styles.fileLabel}>
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
              />
              <ImagePlus size={14} />
              {mainImageFile ? mainImageFile.name : 'Choisir une image…'}
            </label>
            <p className={styles.hint}>
              <Info size={12} />
              Utilisée sur les cartes produit et comme première image de la fiche.
            </p>
          </div>
        </div>
      </div>

      {/* ══ Section: Galerie ══ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><Images size={15} /></span>
          <h3 className={styles.sectionTitle}>Galerie d'images</h3>
        </div>

        <label className={styles.fileLabel}>
          <input
            type="file"
            accept="image/*"
            multiple
            className={styles.fileInput}
            onChange={(e) => setGalleryFiles(e.target.files)}
          />
          <Images size={14} />
          {selectedGalleryCount > 0
            ? `${selectedGalleryCount} fichier${selectedGalleryCount > 1 ? 's' : ''} sélectionné${selectedGalleryCount > 1 ? 's' : ''}`
            : 'Ajouter des images…'}
        </label>

        <p className={`${styles.hint} ${galleryLimitExceeded ? styles.hintError : ''}`}>
          {galleryLimitExceeded
            ? <><TriangleAlert size={12} /> Limite dépassée — max 10 images.</>
            : <><Info size={12} /> {galleryImages.length + selectedGalleryCount}/10 images. Les images de galerie sont optionnelles.</>
          }
        </p>

        {/* existing gallery */}
        {product && galleryImages.length > 0 && (
          <div className={styles.galleryGrid}>
            {galleryImages.map((img) => {
              const src = assetUrl(img.url) || img.url;
              return (
                <div key={img.id} className={styles.galleryCard}>
                  <div className={styles.galleryCardImage}>
                    <Image
                      src={src}
                      alt={img.alt || galleryProduct?.name || 'Image galerie'}
                      fill
                      className={styles.galleryImg}
                      sizes="160px"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.deleteImageBtn}
                    disabled={imageActionId === img.id}
                    onClick={() => void deleteImage(img.id)}
                  >
                    <Trash2 size={13} />
                    {imageActionId === img.id ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ Section: Options ══ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}><Info size={15} /></span>
          <h3 className={styles.sectionTitle}>Options de publication</h3>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkbox}
              name="isFeatured"
              type="checkbox"
              defaultChecked={product?.isFeatured}
            />
            <span className={styles.checkboxBox} />
            <span className={styles.checkboxText}>
              Produit en vedette
              <small>Affiché en priorité sur la page d'accueil</small>
            </span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkbox}
              name="isActive"
              type="checkbox"
              defaultChecked={product?.isActive ?? true}
            />
            <span className={styles.checkboxBox} />
            <span className={styles.checkboxText}>
              Publié
              <small>Visible dans la boutique</small>
            </span>
          </label>
        </div>
      </div>

      {/* ══ Submit ══ */}
      <div className={styles.formFooter}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.back()}
        >
          Annuler
        </button>
        <button
          className={styles.submitBtn}
          disabled={loading || galleryLimitExceeded}
        >
          <Save size={15} />
          {loading ? 'Enregistrement…' : product ? 'Mettre à jour' : 'Créer le produit'}
        </button>
      </div>
    </form>
  );
}

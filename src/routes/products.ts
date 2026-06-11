import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { exec, row, rows, transaction } from '../lib/db';
import { findCategoryBySlug, findProductById, findProductBySlug, findProducts } from '../lib/productQueries';
import { env } from '../config/env';
import { uploadDir } from '../config/uploads';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { InventoryAction } from '../types/domain';
import { slugify } from '../utils';

export const productsRouter = Router();
export const adminProductsRouter = Router();

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const safeBase = slugify(basename).slice(0, 80) || 'image';
    cb(null, `${Date.now()}-${safeBase}${extension.toLowerCase()}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
      return cb(new Error('Format image non autorise.'));
    }

    return cb(null, true);
  }
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  compareAt: z.coerce.number().positive().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  categoryId: z.coerce.number().int(),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  isComingSoon: z.coerce.boolean().optional(),
  disableBasePrice: z.coerce.boolean().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  lowStockAt: z.coerce.number().int().nonnegative().optional(),
  variants: z.array(z.object({
    id: z.coerce.number().int().positive().optional(),
    label: z.string().trim().min(1),
    price: z.coerce.number().positive(),
    compareAt: z.coerce.number().positive().optional().nullable(),
    isDefault: z.coerce.boolean().optional(),
    isActive: z.coerce.boolean().optional(),
    sortOrder: z.coerce.number().int().nonnegative().optional()
  })).optional()
});

type ProductVariantInput = NonNullable<z.infer<typeof productSchema>['variants']>[number] & {
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
};

function normalizeVariants(variants?: z.infer<typeof productSchema>['variants']) {
  const normalized = (variants || [])
    .filter((variant) => variant.label.trim())
    .map((variant, index) => ({
      ...variant,
      label: variant.label.trim(),
      compareAt: variant.compareAt ?? null,
      isDefault: Boolean(variant.isDefault),
      isActive: variant.isActive ?? true,
      sortOrder: variant.sortOrder ?? index
    }));

  if (!normalized.length) return [];
  if (!normalized.some((variant) => variant.isDefault)) normalized[0].isDefault = true;

  let defaultSeen = false;
  return normalized.map((variant) => {
    if (!variant.isDefault) return variant;
    if (!defaultSeen) {
      defaultSeen = true;
      return variant;
    }
    return { ...variant, isDefault: false };
  });
}

async function saveProductVariants(productId: number, variants: ProductVariantInput[], tx: Parameters<typeof exec>[2]) {
  const existing = await rows<{ id: number }>('SELECT id FROM ProductVariant WHERE productId = ?', [productId], tx);
  const submittedIds = new Set(variants.map((variant) => variant.id).filter(Boolean));

  for (const variant of variants) {
    if (variant.id) {
      await exec(
        `
          UPDATE ProductVariant
          SET label = ?, price = ?, compareAt = ?, isDefault = ?, isActive = ?, sortOrder = ?, updatedAt = CURRENT_TIMESTAMP(3)
          WHERE id = ? AND productId = ?
        `,
        [variant.label, variant.price, variant.compareAt, variant.isDefault, variant.isActive, variant.sortOrder, variant.id, productId],
        tx
      );
    } else {
      await exec(
        `
          INSERT INTO ProductVariant
            (productId, label, price, compareAt, isDefault, isActive, sortOrder, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        `,
        [productId, variant.label, variant.price, variant.compareAt, variant.isDefault, variant.isActive, variant.sortOrder],
        tx
      );
    }
  }

  const removedIds = existing.map((variant) => variant.id).filter((id) => !submittedIds.has(id));
  if (removedIds.length) {
    await exec(
      `UPDATE ProductVariant SET isActive = false, isDefault = false, updatedAt = CURRENT_TIMESTAMP(3) WHERE productId = ? AND id IN (${removedIds.map(() => '?').join(',')})`,
      [productId, ...removedIds],
      tx
    );
  }
}

function applyDefaultVariant(productData: any, variants: ProductVariantInput[]) {
  const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];
  if (!defaultVariant) return productData;

  return {
    ...productData,
    price: defaultVariant.price,
    compareAt: defaultVariant.compareAt,
    weight: defaultVariant.label
  };
}

productsRouter.get('/', async (req, res) => {
  const search = req.query.search?.toString();
  const featured = req.query.featured === 'true';
  const where: string[] = ['p.isActive = true'];
  const params: unknown[] = [];

  if (featured) where.push('p.isFeatured = true');
  if (search) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const products = await findProducts(where.join(' AND '), params);
  return res.json({ products });
});

productsRouter.get('/category/:slug', async (req, res) => {
  const category = await findCategoryBySlug(req.params.slug);
  if (!category || !category.isActive) return res.status(404).json({ message: 'Categorie introuvable.' });

  const products = await findProducts('p.isActive = true AND p.categoryId = ?', [category.id]);
  return res.json({
    category: {
      ...category,
      isActive: Boolean(Number(category.isActive))
    },
    products
  });
});

productsRouter.get('/:slug', async (req, res) => {
  const product = await findProductBySlug(req.params.slug);
  if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
  return res.json({ product });
});

adminProductsRouter.use(requireAuth, requireAdmin);

adminProductsRouter.get('/', async (_req, res) => {
  const products = await findProducts();
  return res.json({ products });
});

adminProductsRouter.get('/:id', async (req, res) => {
  const product = await findProductById(Number(req.params.id));
  if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
  return res.json({ product });
});

adminProductsRouter.post('/', async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const { sku, stock = 0, lowStockAt = 5, variants: rawVariants, ...rawProductData } = data;
    const variants = normalizeVariants(rawVariants);
    const productData = applyDefaultVariant(rawProductData, variants);

    const productId = await transaction(async (tx) => {
      const result = await exec(
        `
          INSERT INTO Product
            (name, slug, shortDescription, description, price, compareAt, imageUrl, origin, weight, isFeatured, isActive, isComingSoon, disableBasePrice, categoryId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        `,
        [
          productData.name,
          productData.slug || slugify(productData.name),
          productData.shortDescription ?? null,
          productData.description,
          productData.price,
          productData.compareAt ?? null,
          productData.imageUrl ?? null,
          productData.origin ?? null,
          productData.weight ?? null,
          productData.isFeatured ?? false,
          productData.isActive ?? true,
          productData.isComingSoon ?? false,
          productData.disableBasePrice ?? false,
          productData.categoryId
        ],
        tx
      );

      if (variants.length) await saveProductVariants(result.insertId, variants, tx);

      await exec(
        'INSERT INTO Inventory (productId, sku, stock, lowStockAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3))',
        [result.insertId, sku || `GS-${Date.now()}`, stock, lowStockAt],
        tx
      );
      await exec(
        `
          INSERT INTO InventoryLog (productId, action, quantityBefore, quantityAfter, note, createdAt)
          VALUES (?, ?, 0, ?, 'Creation produit', CURRENT_TIMESTAMP(3))
        `,
        [result.insertId, InventoryAction.INITIAL, stock],
        tx
      );

      return result.insertId;
    });

    const product = await findProductById(productId);
    return res.status(201).json({ message: 'Produit cree.', product });
  } catch (error) {
    return next(error);
  }
});

adminProductsRouter.put('/:id', async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const data = productSchema.partial().parse(req.body);
    const { sku, stock, lowStockAt, variants: rawVariants, ...rawProductData } = data;
    const variants = rawVariants ? normalizeVariants(rawVariants) : undefined;
    const productData = variants ? applyDefaultVariant(rawProductData, variants) : rawProductData;
    const currentInventory = await row<any>('SELECT * FROM Inventory WHERE productId = ?', [productId]);

    await transaction(async (tx) => {
      const productFields: string[] = [];
      const productValues: unknown[] = [];

      for (const key of ['name', 'shortDescription', 'description', 'price', 'compareAt', 'imageUrl', 'origin', 'weight', 'isFeatured', 'isActive', 'isComingSoon', 'disableBasePrice', 'categoryId'] as const) {
        if (productData[key] !== undefined) {
          productFields.push(`${key} = ?`);
          productValues.push(productData[key]);
        }
      }
      if (productData.slug) {
        productFields.push('slug = ?');
        productValues.push(slugify(productData.slug));
      }
      if (productFields.length) {
        productValues.push(productId);
        await exec(`UPDATE Product SET ${productFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?`, productValues, tx);
      }

      if (variants) await saveProductVariants(productId, variants, tx);

      if (stock !== undefined || sku !== undefined || lowStockAt !== undefined) {
        const existing = await row<any>('SELECT * FROM Inventory WHERE productId = ?', [productId], tx);
        if (existing) {
          const inventoryFields: string[] = [];
          const inventoryValues: unknown[] = [];
          if (sku !== undefined) {
            inventoryFields.push('sku = ?');
            inventoryValues.push(sku);
          }
          if (stock !== undefined) {
            inventoryFields.push('stock = ?');
            inventoryValues.push(stock);
          }
          if (lowStockAt !== undefined) {
            inventoryFields.push('lowStockAt = ?');
            inventoryValues.push(lowStockAt);
          }
          if (inventoryFields.length) {
            inventoryValues.push(productId);
            await exec(`UPDATE Inventory SET ${inventoryFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP(3) WHERE productId = ?`, inventoryValues, tx);
          }
        } else {
          await exec(
            'INSERT INTO Inventory (productId, sku, stock, lowStockAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3))',
            [productId, sku || `GS-${productId}`, stock || 0, lowStockAt || 5],
            tx
          );
        }

        if (stock !== undefined && currentInventory?.stock !== stock) {
          await exec(
            `
              INSERT INTO InventoryLog (productId, action, quantityBefore, quantityAfter, note, createdAt)
              VALUES (?, ?, ?, ?, 'Mise a jour admin', CURRENT_TIMESTAMP(3))
            `,
            [productId, InventoryAction.ADJUSTMENT, currentInventory?.stock ?? 0, stock],
            tx
          );
        }
      }
    });

    const product = await findProductById(productId);
    return res.json({ message: 'Produit mis a jour.', product });
  } catch (error) {
    return next(error);
  }
});

adminProductsRouter.delete('/:id', async (req, res) => {
  await exec('UPDATE Product SET isActive = false, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?', [Number(req.params.id)]);
  return res.json({ message: 'Produit supprime.' });
});

adminProductsRouter.post('/:id/images', upload.array('images', 8), async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const files = req.files as Express.Multer.File[];

    if (!files?.length) return res.status(400).json({ message: 'Au moins une image est requise.' });

    const countRow = await row<{ count: number }>(
      `
        SELECT COUNT(*) AS count
        FROM ProductImage pi
        JOIN Product p ON p.id = pi.productId
        WHERE pi.productId = ? AND (p.imageUrl IS NULL OR pi.url <> p.imageUrl)
      `,
      [productId]
    );
    const existingCount = Number(countRow?.count || 0);

    if (existingCount + files.length > 10) {
      return res.status(400).json({ message: 'La galerie ne peut pas depasser 10 images.' });
    }

    const images = await transaction(async (tx) => {
      const created: any[] = [];
      for (const [index, file] of files.entries()) {
        const result = await exec(
          `
            INSERT INTO ProductImage (productId, url, alt, sortOrder, isPrimary, createdAt)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3))
          `,
          [productId, `/uploads/${file.filename}`, req.body.alt || null, existingCount + index, false],
          tx
        );
        const image = await row<any>('SELECT * FROM ProductImage WHERE id = ?', [result.insertId], tx);
        created.push(image);
      }

      return created;
    });

    return res.status(201).json({ message: 'Images ajoutees.', images });
  } catch (error) {
    return next(error);
  }
});

adminProductsRouter.post('/:id/main-image', upload.single('image'), async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const file = req.file as Express.Multer.File | undefined;

    if (!file) return res.status(400).json({ message: 'Image principale requise.' });

    await exec('UPDATE Product SET imageUrl = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?', [`/uploads/${file.filename}`, productId]);

    const product = await findProductById(productId);
    return res.status(201).json({ message: 'Image principale mise a jour.', product });
  } catch (error) {
    return next(error);
  }
});

adminProductsRouter.put('/:id/images/:imageId/primary', async (req, res) => {
  const productId = Number(req.params.id);
  const imageId = Number(req.params.imageId);
  const image = await row<any>('SELECT * FROM ProductImage WHERE id = ? AND productId = ?', [imageId, productId]);

  if (!image) return res.status(404).json({ message: 'Image introuvable.' });

  await transaction(async (tx) => {
    await exec('UPDATE ProductImage SET isPrimary = false WHERE productId = ?', [productId], tx);
    await exec('UPDATE ProductImage SET isPrimary = true WHERE id = ?', [imageId], tx);
    await exec('UPDATE Product SET imageUrl = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?', [image.url, productId], tx);
  });

  const product = await findProductById(productId);
  return res.json({ message: 'Image principale mise a jour.', product });
});

adminProductsRouter.delete('/:id/images/:imageId', async (req, res) => {
  const productId = Number(req.params.id);
  const imageId = Number(req.params.imageId);
  const image = await row<any>('SELECT * FROM ProductImage WHERE id = ? AND productId = ?', [imageId, productId]);

  if (!image) return res.status(404).json({ message: 'Image introuvable.' });

  await exec('DELETE FROM ProductImage WHERE id = ?', [imageId]);

  const product = await findProductById(productId);
  return res.json({ message: 'Image supprimee.', product });
});

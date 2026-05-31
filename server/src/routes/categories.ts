import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { rows, row, exec, bool } from '../lib/db';
import { env } from '../config/env';
import { uploadDir } from '../config/uploads';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { slugify } from '../utils';

export const categoriesRouter = Router();
export const adminCategoriesRouter = Router();

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.coerce.boolean().optional()
});

function serializeCategory(category: any) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    isActive: bool(category.isActive),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    _count: { products: Number(category.productsCount || 0) }
  };
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const safeBase = slugify(basename).slice(0, 80) || 'categorie';
    cb(null, `${Date.now()}-${safeBase}${extension.toLowerCase()}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 1 },
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

async function categoryList(whereSql = '1 = 1', orderBy = 'c.name ASC') {
  const categories = await rows<any>(
    `
      SELECT c.*, COUNT(p.id) AS productsCount
      FROM Category c
      LEFT JOIN Product p ON p.categoryId = c.id
      WHERE ${whereSql}
      GROUP BY c.id
      ORDER BY ${orderBy}
    `
  );

  return categories.map(serializeCategory);
}

categoriesRouter.get('/', async (_req, res) => {
  const categories = await categoryList('c.isActive = true');
  return res.json({ categories });
});

adminCategoriesRouter.use(requireAuth, requireAdmin);

adminCategoriesRouter.get('/', async (_req, res) => {
  const categories = await categoryList('1 = 1', 'c.createdAt DESC');
  return res.json({ categories });
});

adminCategoriesRouter.post('/', async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const result = await exec(
      `
        INSERT INTO Category (name, slug, description, imageUrl, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
      `,
      [data.name, data.slug || slugify(data.name), data.description ?? null, data.imageUrl ?? null, data.isActive ?? true]
    );
    const category = await row<any>('SELECT *, 0 AS productsCount FROM Category WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Categorie creee.', category: serializeCategory(category) });
  } catch (error) {
    return next(error);
  }
});

adminCategoriesRouter.post('/:id/image', upload.single('image'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Une image est requise.' });

    await exec('UPDATE Category SET imageUrl = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?', [`/uploads/${file.filename}`, Number(req.params.id)]);
    const category = await row<any>('SELECT *, 0 AS productsCount FROM Category WHERE id = ?', [Number(req.params.id)]);

    return res.status(201).json({ message: 'Image de categorie ajoutee.', category: serializeCategory(category) });
  } catch (error) {
    return next(error);
  }
});

adminCategoriesRouter.put('/:id', async (req, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of ['name', 'description', 'imageUrl', 'isActive'] as const) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (data.slug) {
      fields.push('slug = ?');
      values.push(slugify(data.slug));
    }

    if (fields.length) {
      values.push(Number(req.params.id));
      await exec(`UPDATE Category SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?`, values);
    }

    const category = await row<any>('SELECT *, 0 AS productsCount FROM Category WHERE id = ?', [Number(req.params.id)]);
    return res.json({ message: 'Categorie mise a jour.', category: serializeCategory(category) });
  } catch (error) {
    return next(error);
  }
});

adminCategoriesRouter.delete('/:id', async (req, res) => {
  await exec('UPDATE Category SET isActive = false, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?', [Number(req.params.id)]);
  return res.json({ message: 'Categorie supprimee.' });
});

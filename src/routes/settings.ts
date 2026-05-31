import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { getStoreSettings } from '../lib/settings';
import { exec } from '../lib/db';
import { env } from '../config/env';
import { uploadDir } from '../config/uploads';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { slugify } from '../utils';

export const settingsRouter = Router();
export const adminSettingsRouter = Router();

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const safeBase = slugify(basename).slice(0, 80) || 'accueil';
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

const settingsSchema = z.object({
  deliveryFee: z.coerce.number().min(0),
  freeDelivery: z.coerce.boolean()
});

const homepageImageSlotSchema = z.enum(['hero', 'story']);

settingsRouter.get('/', async (_req, res) => {
  const settings = await getStoreSettings();
  return res.json({ settings });
});

adminSettingsRouter.use(requireAuth, requireAdmin);

adminSettingsRouter.get('/', async (_req, res) => {
  const settings = await getStoreSettings();
  return res.json({ settings });
});

adminSettingsRouter.put('/', async (req, res, next) => {
  try {
    const data = settingsSchema.parse(req.body);
    await getStoreSettings();
    await exec(
      `
        UPDATE StoreSetting
        SET deliveryFee = ?, freeDelivery = ?, paymentMethodLabel = 'Paiement a la livraison',
            paymentProvider = 'cash_on_delivery', updatedAt = CURRENT_TIMESTAMP(3)
        WHERE id = 1
      `,
      [data.deliveryFee, data.freeDelivery]
    );
    const settings = await getStoreSettings();

    return res.json({ message: 'Parametres mis a jour.', settings });
  } catch (error) {
    return next(error);
  }
});

adminSettingsRouter.post('/homepage-images/:slot', upload.single('image'), async (req, res, next) => {
  try {
    const slot = homepageImageSlotSchema.parse(req.params.slot);
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Une image est requise.' });

    const imageUrl = `/uploads/${file.filename}`;

    await getStoreSettings();
    const field = slot === 'hero' ? 'homeHeroImageUrl' : 'homeStoryImageUrl';
    await exec(`UPDATE StoreSetting SET ${field} = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = 1`, [imageUrl]);
    const settings = await getStoreSettings();

    return res.status(201).json({ message: 'Image de la page accueil mise a jour.', settings });
  } catch (error) {
    return next(error);
  }
});

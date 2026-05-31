import { Router } from 'express';
import { z } from 'zod';
import { exec, row, rows, bool, decimal, nullableDate } from '../lib/db';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { DiscountType } from '../types/domain';

export const couponsRouter = Router();
export const adminCouponsRouter = Router();

const schema = z.object({
  code: z.string().min(3).transform((value) => value.toUpperCase()),
  description: z.string().optional().nullable(),
  discountType: z.nativeEnum(DiscountType),
  value: z.coerce.number().positive(),
  minimumAmount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  usedCount: z.coerce.number().int().nonnegative().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.coerce.boolean().optional()
});

function serializeCoupon(coupon: any) {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    value: decimal(coupon.value),
    minimumAmount: decimal(coupon.minimumAmount),
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    expiresAt: coupon.expiresAt,
    isActive: bool(coupon.isActive),
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt
  };
}

couponsRouter.post('/validate', async (req, res, next) => {
  try {
    const body = z.object({
      code: z.string().min(3),
      subtotal: z.coerce.number().nonnegative()
    }).parse(req.body);

    const coupon = await row<any>('SELECT * FROM Coupon WHERE code = ? LIMIT 1', [body.code.toUpperCase()]);

    if (
      !coupon ||
      !bool(coupon.isActive) ||
      (nullableDate(coupon.expiresAt) && nullableDate(coupon.expiresAt)! < new Date()) ||
      (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
    ) {
      return res.status(404).json({ message: 'Coupon invalide.' });
    }

    const minimum = Number(coupon.minimumAmount ?? 0);
    if (minimum && body.subtotal < minimum) {
      return res.status(400).json({ message: 'Montant minimum non atteint.' });
    }

    const discount =
      coupon.discountType === DiscountType.PERCENTAGE
        ? body.subtotal * (Number(coupon.value) / 100)
        : Number(coupon.value);

    return res.json({
      message: 'Coupon valide.',
      coupon: serializeCoupon(coupon),
      discount: Math.min(discount, body.subtotal)
    });
  } catch (error) {
    return next(error);
  }
});

adminCouponsRouter.use(requireAuth, requireAdmin);

adminCouponsRouter.get('/', async (_req, res) => {
  const coupons = await rows<any>('SELECT * FROM Coupon ORDER BY createdAt DESC');
  return res.json({ coupons: coupons.map(serializeCoupon) });
});

adminCouponsRouter.post('/', async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const result = await exec(
      `
        INSERT INTO Coupon
          (code, description, discountType, value, minimumAmount, usageLimit, usedCount, expiresAt, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
      `,
      [
        data.code,
        data.description ?? null,
        data.discountType,
        data.value,
        data.minimumAmount ?? null,
        data.usageLimit ?? null,
        data.usedCount ?? 0,
        data.expiresAt ?? null,
        data.isActive ?? true
      ]
    );
    const coupon = await row<any>('SELECT * FROM Coupon WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Coupon cree.', coupon: serializeCoupon(coupon) });
  } catch (error) {
    return next(error);
  }
});

adminCouponsRouter.put('/:id', async (req, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of ['code', 'description', 'discountType', 'value', 'minimumAmount', 'usageLimit', 'usedCount', 'expiresAt', 'isActive'] as const) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length) {
      values.push(Number(req.params.id));
      await exec(`UPDATE Coupon SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?`, values);
    }

    const coupon = await row<any>('SELECT * FROM Coupon WHERE id = ?', [Number(req.params.id)]);
    return res.json({ message: 'Coupon mis a jour.', coupon: serializeCoupon(coupon) });
  } catch (error) {
    return next(error);
  }
});

adminCouponsRouter.delete('/:id', async (req, res) => {
  await exec('UPDATE Coupon SET isActive = false, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?', [Number(req.params.id)]);
  return res.json({ message: 'Coupon supprime.' });
});

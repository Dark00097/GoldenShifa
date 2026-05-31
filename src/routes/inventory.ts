import { Router } from 'express';
import { z } from 'zod';
import { exec, row, rows, bool } from '../lib/db';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { InventoryAction } from '../types/domain';

export const inventoryRouter = Router();

const schema = z.object({
  sku: z.string().min(2).optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  lowStockAt: z.coerce.number().int().nonnegative().optional()
});

function serializeInventory(item: any) {
  return {
    id: item.id,
    productId: item.productId,
    sku: item.sku,
    stock: item.stock,
    lowStockAt: item.lowStockAt,
    updatedAt: item.updatedAt,
    product: {
      id: item.product_id,
      name: item.product_name,
      slug: item.product_slug,
      imageUrl: item.product_imageUrl,
      isActive: bool(item.product_isActive),
      category: item.category_id
        ? {
            id: item.category_id,
            name: item.category_name,
            slug: item.category_slug
          }
        : null
    }
  };
}

inventoryRouter.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const inventory = await rows<any>(
    `
      SELECT
        i.*,
        p.id AS product_id, p.name AS product_name, p.slug AS product_slug, p.imageUrl AS product_imageUrl, p.isActive AS product_isActive,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug
      FROM Inventory i
      LEFT JOIN Product p ON p.id = i.productId
      LEFT JOIN Category c ON c.id = p.categoryId
      ORDER BY i.updatedAt DESC
    `
  );

  return res.json({ inventory: inventory.map(serializeInventory) });
});

inventoryRouter.put('/:productId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const data = schema.parse(req.body);
    const current = await row<any>('SELECT * FROM Inventory WHERE productId = ?', [productId]);

    if (current) {
      const fields: string[] = [];
      const values: unknown[] = [];
      for (const key of ['sku', 'stock', 'lowStockAt'] as const) {
        if (data[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }
      if (fields.length) {
        values.push(productId);
        await exec(`UPDATE Inventory SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP(3) WHERE productId = ?`, values);
      }
    } else {
      await exec(
        'INSERT INTO Inventory (productId, sku, stock, lowStockAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3))',
        [productId, data.sku || `GS-${req.params.productId}`, data.stock || 0, data.lowStockAt || 5]
      );
    }

    if (data.stock !== undefined && current?.stock !== data.stock) {
      await exec(
        `
          INSERT INTO InventoryLog (productId, action, quantityBefore, quantityAfter, note, createdAt)
          VALUES (?, ?, ?, ?, 'Mise a jour inventaire admin', CURRENT_TIMESTAMP(3))
        `,
        [productId, current ? InventoryAction.ADJUSTMENT : InventoryAction.INITIAL, current?.stock ?? 0, data.stock]
      );
    }

    const inventory = await row<any>('SELECT * FROM Inventory WHERE productId = ?', [productId]);
    return res.json({ message: 'Inventaire mis a jour.', inventory });
  } catch (error) {
    return next(error);
  }
});

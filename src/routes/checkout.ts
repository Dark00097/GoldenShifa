import { Router } from 'express';
import { z } from 'zod';
import { exec, row, rows, transaction, bool, nullableDate, decimal } from '../lib/db';
import { getStoreSettings } from '../lib/settings';
import { createCheckoutSession } from '../services/payment';
import { DiscountType, InventoryAction, OrderStatus, PaymentStatus } from '../types/domain';
import { orderNumber } from '../utils';

export const checkoutRouter = Router();

type CheckoutOrderItem = {
  product: any;
  variant: any | null;
  quantity: number;
  unitPrice: number;
  total: number;
  currentStock: number;
};

const checkoutItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive().optional().nullable(),
  quantity: z.coerce.number().int().positive()
});

const addressSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  postalCode: z.string().optional(),
  country: z.string().default('Tunisie')
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  couponCode: z.string().optional(),
  address: addressSchema
});

checkoutRouter.post('/', async (req, res, next) => {
  try {
    const data = checkoutSchema.parse(req.body);
    const productIds = data.items.map((item) => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    const placeholders = uniqueProductIds.map(() => '?').join(',');

    const products = await rows<any>(
      `
        SELECT p.*, i.stock AS inventory_stock
        FROM Product p
        LEFT JOIN Inventory i ON i.productId = p.id
        WHERE p.id IN (${placeholders}) AND p.isActive = true
      `,
      uniqueProductIds
    );
    const variants = await rows<any>(
      `
        SELECT *
        FROM ProductVariant
        WHERE productId IN (${placeholders}) AND isActive = true
        ORDER BY isDefault DESC, sortOrder ASC, id ASC
      `,
      uniqueProductIds
    );

    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ message: 'Un produit est indisponible.' });
    }

    let subtotal = 0;
    const orderItems: CheckoutOrderItem[] = [];
    for (const item of data.items) {
      const product = products.find((entry) => entry.id === item.productId)!;
      const productVariants = variants.filter((entry) => entry.productId === item.productId);
      const variant = item.variantId
        ? productVariants.find((entry) => entry.id === item.variantId)
        : bool(product.disableBasePrice)
          ? null
          : productVariants.find((entry) => bool(entry.isDefault)) || productVariants[0] || null;
      const currentStock = Number(product.inventory_stock ?? 0);

      if (bool(product.isComingSoon)) {
        return res.status(400).json({ message: `${product.name} sera disponible bientot.` });
      }

      if (item.variantId && !variant) {
        return res.status(400).json({ message: `Format indisponible pour ${product.name}.` });
      }

      if (bool(product.disableBasePrice) && !variant) {
        return res.status(400).json({ message: `Veuillez choisir un poids pour ${product.name}.` });
      }

      if (currentStock < item.quantity) {
        return res.status(400).json({ message: `Stock insuffisant pour ${product.name}.` });
      }

      const unitPrice = Number(variant?.price ?? product.price);
      const total = unitPrice * item.quantity;
      subtotal += total;
      orderItems.push({ product, variant, quantity: item.quantity, unitPrice, total, currentStock });
    }

    const coupon = data.couponCode
      ? await row<any>('SELECT * FROM Coupon WHERE code = ? LIMIT 1', [data.couponCode.toUpperCase()])
      : null;

    let discountTotal = 0;
    if (
      coupon &&
      bool(coupon.isActive) &&
      (!nullableDate(coupon.expiresAt) || nullableDate(coupon.expiresAt)! >= new Date()) &&
      (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit)
    ) {
      const minimum = Number(coupon.minimumAmount ?? 0);
      if (subtotal >= minimum) {
        discountTotal =
          coupon.discountType === DiscountType.PERCENTAGE
            ? subtotal * (Number(coupon.value) / 100)
            : Number(coupon.value);
      }
    }
    discountTotal = Math.min(discountTotal, subtotal);

    const settings = await getStoreSettings();
    const shippingTotal = settings.freeDelivery ? 0 : Number(settings.deliveryFee);
    const total = subtotal - discountTotal + shippingTotal;

    const created = await transaction(async (tx) => {
      const number = orderNumber();
      const orderResult = await exec(
        `
          INSERT INTO \`Order\`
            (orderNumber, userId, customerName, customerEmail, customerPhone, shippingLine1, shippingCity,
             subtotal, discountTotal, shippingTotal, total, status, couponId, createdAt, updatedAt)
          VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        `,
        [
          number,
          data.address.fullName,
          data.address.email,
          data.address.phone ?? null,
          [data.address.line1, data.address.line2, data.address.postalCode, data.address.country].filter(Boolean).join(', '),
          data.address.city,
          subtotal,
          discountTotal,
          shippingTotal,
          total,
          OrderStatus.CONFIRMED,
          coupon?.id ?? null
        ],
        tx
      );

      for (const item of orderItems) {
        await exec(
          'INSERT INTO OrderItem (orderId, productId, productVariantId, name, variantLabel, quantity, unitPrice, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            orderResult.insertId,
            item.product.id,
            item.variant?.id ?? null,
            item.product.name,
            item.variant?.label ?? item.product.weight ?? null,
            item.quantity,
            item.unitPrice,
            item.total
          ],
          tx
        );
        await exec('UPDATE Inventory SET stock = stock - ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE productId = ?', [item.quantity, item.product.id], tx);
        await exec(
          `
            INSERT INTO InventoryLog (productId, action, quantityBefore, quantityAfter, note, createdAt)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3))
          `,
          [item.product.id, InventoryAction.SALE, item.currentStock, item.currentStock - item.quantity, `Commande ${number}`],
          tx
        );
      }

      await exec(
        `
          INSERT INTO Payment (orderId, provider, status, amount, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        `,
        [orderResult.insertId, settings.paymentProvider, PaymentStatus.PENDING, total],
        tx
      );

      if (coupon) await exec('UPDATE Coupon SET usedCount = usedCount + 1, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?', [coupon.id], tx);

      const order = await row<any>('SELECT * FROM `Order` WHERE id = ?', [orderResult.insertId], tx);
      const items = await rows<any>('SELECT * FROM OrderItem WHERE orderId = ?', [orderResult.insertId], tx);
      const payment = await row<any>('SELECT * FROM Payment WHERE orderId = ?', [orderResult.insertId], tx);
      return {
        ...order,
        subtotal: decimal(order.subtotal),
        discountTotal: decimal(order.discountTotal),
        shippingTotal: decimal(order.shippingTotal),
        total: decimal(order.total),
        items: items.map((item) => ({ ...item, unitPrice: decimal(item.unitPrice), total: decimal(item.total) })),
        payment: payment ? { ...payment, amount: decimal(payment.amount) } : null
      };
    });

    const checkout = await createCheckoutSession({
      orderId: created.id,
      orderNumber: created.orderNumber,
      total: String(created.total),
      provider: settings.paymentProvider
    });

    await exec('UPDATE Payment SET provider = ?, reference = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE orderId = ?', [
      checkout.provider,
      checkout.paymentRef,
      created.id
    ]);

    return res.status(201).json({ message: 'Commande invite creee.', order: created, checkout });
  } catch (error) {
    return next(error);
  }
});

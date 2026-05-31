import { Router } from 'express';
import { z } from 'zod';
import { exec, row, rows, bool, decimal } from '../lib/db';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { OrderStatus, PaymentStatus } from '../types/domain';

export const ordersRouter = Router();
export const adminOrdersRouter = Router();

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional()
});

function serializePayment(payment: any) {
  return payment?.payment_id
    ? {
        id: payment.payment_id,
        provider: payment.payment_provider,
        status: payment.payment_status,
        amount: decimal(payment.payment_amount),
        reference: payment.payment_reference,
        metadata: payment.payment_metadata,
        createdAt: payment.payment_createdAt,
        updatedAt: payment.payment_updatedAt
      }
    : null;
}

function serializeOrder(order: any, items: any[] = []) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    addressId: order.addressId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingLine1: order.shippingLine1,
    shippingCity: order.shippingCity,
    subtotal: decimal(order.subtotal),
    discountTotal: decimal(order.discountTotal),
    shippingTotal: decimal(order.shippingTotal),
    total: decimal(order.total),
    status: order.status,
    couponId: order.couponId,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: decimal(item.unitPrice),
      total: decimal(item.total),
      product: item.product_id
        ? {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            imageUrl: item.product_imageUrl,
            isActive: bool(item.product_isActive)
          }
        : null
    })),
    user: order.user_id
      ? {
          id: order.user_id,
          name: order.user_name,
          email: order.user_email,
          phone: order.user_phone
        }
      : null,
    address: order.address_id
      ? {
          id: order.address_id,
          fullName: order.address_fullName,
          phone: order.address_phone,
          line1: order.address_line1,
          line2: order.address_line2,
          city: order.address_city,
          postalCode: order.address_postalCode,
          country: order.address_country,
          isDefault: bool(order.address_isDefault)
        }
      : null,
    coupon: order.coupon_id
      ? {
          id: order.coupon_id,
          code: order.coupon_code,
          description: order.coupon_description,
          discountType: order.coupon_discountType,
          value: decimal(order.coupon_value)
        }
      : null,
    payment: serializePayment(order)
  };
}

async function orderRows(whereSql = '1 = 1', params: unknown[] = []) {
  return rows<any>(
    `
      SELECT
        o.*,
        u.id AS user_id, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
        a.id AS address_id, a.fullName AS address_fullName, a.phone AS address_phone, a.line1 AS address_line1,
        a.line2 AS address_line2, a.city AS address_city, a.postalCode AS address_postalCode,
        a.country AS address_country, a.isDefault AS address_isDefault,
        c.id AS coupon_id, c.code AS coupon_code, c.description AS coupon_description,
        c.discountType AS coupon_discountType, c.value AS coupon_value,
        p.id AS payment_id, p.provider AS payment_provider, p.status AS payment_status,
        p.amount AS payment_amount, p.reference AS payment_reference, p.metadata AS payment_metadata,
        p.createdAt AS payment_createdAt, p.updatedAt AS payment_updatedAt
      FROM \`Order\` o
      LEFT JOIN User u ON u.id = o.userId
      LEFT JOIN Address a ON a.id = o.addressId
      LEFT JOIN Coupon c ON c.id = o.couponId
      LEFT JOIN Payment p ON p.orderId = o.id
      WHERE ${whereSql}
      ORDER BY o.createdAt DESC
    `,
    params
  );
}

async function itemsForOrders(orderIds: number[]) {
  if (!orderIds.length) return new Map<number, any[]>();
  const items = await rows<any>(
    `
      SELECT
        oi.*,
        p.id AS product_id, p.name AS product_name, p.slug AS product_slug,
        p.imageUrl AS product_imageUrl, p.isActive AS product_isActive
      FROM OrderItem oi
      LEFT JOIN Product p ON p.id = oi.productId
      WHERE oi.orderId IN (${orderIds.map(() => '?').join(',')})
      ORDER BY oi.id ASC
    `,
    orderIds
  );

  const map = new Map<number, any[]>();
  for (const item of items) {
    const current = map.get(item.orderId) || [];
    current.push(item);
    map.set(item.orderId, current);
  }
  return map;
}

async function findOrders(whereSql = '1 = 1', params: unknown[] = []) {
  const orderList = await orderRows(whereSql, params);
  const itemMap = await itemsForOrders(orderList.map((order) => order.id));
  return orderList.map((order) => serializeOrder(order, itemMap.get(order.id) || []));
}

adminOrdersRouter.use(requireAuth, requireAdmin);

adminOrdersRouter.get('/', async (_req, res) => {
  const orders = await findOrders();
  return res.json({ orders });
});

adminOrdersRouter.get('/:id', async (req, res) => {
  const orders = await findOrders('o.id = ?', [Number(req.params.id)]);
  const order = orders[0];
  if (!order) return res.status(404).json({ message: 'Commande introuvable.' });
  return res.json({ order });
});

adminOrdersRouter.put('/:id/status', async (req, res, next) => {
  try {
    const data = statusSchema.parse(req.body);
    const orderId = Number(req.params.id);

    if (data.status) {
      await exec('UPDATE `Order` SET status = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?', [data.status, orderId]);
    }
    if (data.paymentStatus) {
      await exec('UPDATE Payment SET status = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE orderId = ?', [data.paymentStatus, orderId]);
    }

    const orders = await findOrders('o.id = ?', [orderId]);
    return res.json({ message: 'Statut de commande mis a jour.', order: orders[0] });
  } catch (error) {
    return next(error);
  }
});

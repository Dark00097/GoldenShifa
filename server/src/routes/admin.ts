import { Router } from 'express';
import { row, rows, decimal } from '../lib/db';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { OrderStatus } from '../types/domain';

export const adminRouter = Router();

adminRouter.get('/dashboard/stats', requireAuth, requireAdmin, async (_req, res) => {
  const [
    orders,
    pendingOrders,
    products,
    activeProducts,
    categories,
    coupons,
    activeCoupons,
    lowStock,
    todayOrders,
    revenue,
    recentOrders,
    orderStatusRows,
    lowStockProducts,
    allOrderRows
  ] = await Promise.all([
    row<{ count: number }>('SELECT COUNT(*) AS count FROM `Order`'),
    row<{ count: number }>('SELECT COUNT(*) AS count FROM `Order` WHERE status IN (?, ?)', [OrderStatus.PENDING, OrderStatus.CONFIRMED]),
    row<{ count: number }>('SELECT COUNT(*) AS count FROM Product'),
    row<{ count: number }>('SELECT COUNT(*) AS count FROM Product WHERE isActive = 1'),
    row<{ count: number }>('SELECT COUNT(*) AS count FROM Category'),
    row<{ count: number }>('SELECT COUNT(*) AS count FROM Coupon'),
    row<{ count: number }>('SELECT COUNT(*) AS count FROM Coupon WHERE isActive = 1 AND (expiresAt IS NULL OR expiresAt > NOW())'),
    row<{ count: number }>('SELECT COUNT(*) AS count FROM Inventory WHERE stock <= lowStockAt'),
    row<{ count: number; total: string | number | null }>(
      'SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total FROM `Order` WHERE DATE(createdAt) = CURRENT_DATE()'
    ),
    row<{ total: string | number | null }>('SELECT COALESCE(SUM(total), 0) AS total FROM `Order`'),
    rows<any>(
      `
        SELECT o.*, p.id AS payment_id, p.provider AS payment_provider, p.status AS payment_status,
               p.amount AS payment_amount, u.id AS user_id, u.name AS user_name, u.email AS user_email
        FROM \`Order\` o
        LEFT JOIN Payment p ON p.orderId = o.id
        LEFT JOIN User u ON u.id = o.userId
        ORDER BY o.createdAt DESC
        LIMIT 5
      `
    ),
    rows<{ status: string; count: number }>('SELECT status, COUNT(*) AS count FROM `Order` GROUP BY status'),
    rows<any>(
      `
        SELECT i.id, i.sku, i.stock, i.lowStockAt, p.id AS product_id, p.name AS product_name, p.slug AS product_slug
        FROM Inventory i
        LEFT JOIN Product p ON p.id = i.productId
        WHERE i.stock <= i.lowStockAt
        ORDER BY i.stock ASC, i.updatedAt DESC
        LIMIT 5
      `
    ),
    rows<any>(
      `
        SELECT o.createdAt, oi.name, oi.quantity, oi.total
        FROM \`Order\` o
        LEFT JOIN OrderItem oi ON oi.orderId = o.id
        ORDER BY o.createdAt ASC
      `
    )
  ]);

  const salesByDate = new Map<string, number>();
  const bestSellingMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  for (const entry of allOrderRows) {
    const date = new Date(entry.createdAt).toISOString().slice(0, 10);
    salesByDate.set(date, (salesByDate.get(date) || 0) + Number(entry.total || 0));

    if (entry.name) {
      const current = bestSellingMap.get(entry.name) || { name: entry.name, quantity: 0, revenue: 0 };
      current.quantity += Number(entry.quantity || 0);
      current.revenue += Number(entry.total || 0);
      bestSellingMap.set(entry.name, current);
    }
  }

  return res.json({
    stats: {
      commandes: orders?.count || 0,
      commandesEnAttente: pendingOrders?.count || 0,
      produits: products?.count || 0,
      produitsActifs: activeProducts?.count || 0,
      categories: categories?.count || 0,
      coupons: coupons?.count || 0,
      couponsActifs: activeCoupons?.count || 0,
      stockFaible: lowStock?.count || 0,
      commandesAujourdhui: todayOrders?.count || 0,
      chiffreAffairesAujourdhui: todayOrders?.total || 0,
      chiffreAffaires: revenue?.total || 0,
      panierMoyen: orders?.count ? Number(revenue?.total || 0) / orders.count : 0
    },
    orderStatusBreakdown: orderStatusRows.map((item) => ({ status: item.status, count: item.count })),
    lowStockProducts: lowStockProducts.map((item) => ({
      id: item.id,
      sku: item.sku,
      stock: item.stock,
      lowStockAt: item.lowStockAt,
      product: {
        id: item.product_id,
        name: item.product_name,
        slug: item.product_slug
      }
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: decimal(order.total),
      status: order.status,
      createdAt: order.createdAt,
      payment: order.payment_id
        ? {
            id: order.payment_id,
            provider: order.payment_provider,
            status: order.payment_status,
            amount: decimal(order.payment_amount)
          }
        : null,
      user: order.user_id ? { id: order.user_id, name: order.user_name, email: order.user_email } : null
    })),
    salesChart: Array.from(salesByDate, ([date, total]) => ({ date, total })).slice(-14),
    bestSellingProducts: Array.from(bestSellingMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  });
});

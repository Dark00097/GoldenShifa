import { rows, row, bool, decimal } from './db';

type Executor = Parameters<typeof rows>[2];

function productSelect() {
  return `
    p.id, p.name, p.slug, p.shortDescription, p.description, p.price, p.compareAt, p.imageUrl,
    p.origin, p.weight, p.isFeatured, p.isActive, p.categoryId, p.createdAt, p.updatedAt,
    c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.description AS category_description,
    c.imageUrl AS category_imageUrl, c.isActive AS category_isActive,
    i.id AS inventory_id, i.sku AS inventory_sku, i.stock AS inventory_stock, i.lowStockAt AS inventory_lowStockAt
  `;
}

export function serializeProduct(data: any, images: any[] = []) {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    shortDescription: data.shortDescription,
    description: data.description,
    price: decimal(data.price),
    compareAt: decimal(data.compareAt),
    imageUrl: data.imageUrl,
    origin: data.origin,
    weight: data.weight,
    isFeatured: bool(data.isFeatured),
    isActive: bool(data.isActive),
    categoryId: data.categoryId,
    category: data.category_id
      ? {
          id: data.category_id,
          name: data.category_name,
          slug: data.category_slug,
          description: data.category_description,
          imageUrl: data.category_imageUrl,
          isActive: bool(data.category_isActive)
        }
      : null,
    images: images.map((image) => ({
      id: image.id,
      productId: image.productId,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
      isPrimary: bool(image.isPrimary),
      createdAt: image.createdAt
    })),
    inventory: data.inventory_id
      ? {
          id: data.inventory_id,
          sku: data.inventory_sku,
          stock: data.inventory_stock,
          lowStockAt: data.inventory_lowStockAt
        }
      : null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

async function imagesForProducts(productIds: number[], executor?: Executor) {
  if (!productIds.length) return new Map<number, any[]>();

  const images = await rows<any>(
    `SELECT * FROM ProductImage WHERE productId IN (${productIds.map(() => '?').join(',')}) ORDER BY isPrimary DESC, sortOrder ASC`,
    productIds,
    executor
  );

  const map = new Map<number, any[]>();
  for (const image of images) {
    const current = map.get(image.productId) || [];
    current.push(image);
    map.set(image.productId, current);
  }
  return map;
}

export async function findProducts(whereSql = '1 = 1', params: unknown[] = [], orderBy = 'p.createdAt DESC', executor?: Executor) {
  const productRows = await rows<any>(
    `
      SELECT ${productSelect()}
      FROM Product p
      LEFT JOIN Category c ON c.id = p.categoryId
      LEFT JOIN Inventory i ON i.productId = p.id
      WHERE ${whereSql}
      ORDER BY ${orderBy}
    `,
    params,
    executor
  );

  const imageMap = await imagesForProducts(productRows.map((product) => product.id), executor);
  return productRows.map((product) => serializeProduct(product, imageMap.get(product.id) || []));
}

export async function findProductById(id: number, executor?: Executor) {
  const products = await findProducts('p.id = ?', [id], 'p.createdAt DESC', executor);
  return products[0] ?? null;
}

export async function findProductBySlug(slug: string, onlyActive = true, executor?: Executor) {
  const products = await findProducts(onlyActive ? 'p.slug = ? AND p.isActive = true' : 'p.slug = ?', [slug], 'p.createdAt DESC', executor);
  return products[0] ?? null;
}

export async function findCategoryBySlug(slug: string, executor?: Executor) {
  return row<any>('SELECT * FROM Category WHERE slug = ?', [slug], executor);
}

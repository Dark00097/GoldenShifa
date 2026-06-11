export type Role = 'CUSTOMER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  _count?: { products: number };
};

export type ProductImage = {
  id: number;
  productId: number;
  url: string;
  alt?: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: number;
  productId: number;
  label: string;
  price: string;
  compareAt?: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  price: string;
  compareAt?: string | null;
  imageUrl?: string | null;
  origin?: string | null;
  weight?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  isComingSoon?: boolean;
  disableBasePrice?: boolean;
  category: Category;
  categoryId: number;
  variants?: ProductVariant[];
  images?: ProductImage[];
  inventory?: {
    id: number;
    sku: string;
    stock: number;
    lowStockAt: number;
  } | null;
};

export type CartItem = {
  id?: number;
  key?: string;
  product: Product;
  variant?: ProductVariant | null;
  variantId?: number | null;
  weightLabel?: string | null;
  unitPrice?: string;
  productId?: number;
  quantity: number;
};

export type Cart = {
  id: number;
  userId: number;
  items: CartItem[];
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
};

export type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingLine1: string;
  shippingCity: string;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  total: string;
  status: OrderStatus;
  createdAt: string;
  items: Array<{
    id: number;
    name: string;
    productVariantId?: number | null;
    variantLabel?: string | null;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  payment?: {
    provider: string;
    status: string;
    amount: string;
    reference?: string | null;
  } | null;
};

export type Coupon = {
  id: number;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  value: string;
  minimumAmount?: string | null;
  usageLimit?: number | null;
  usedCount?: number;
  expiresAt?: string | null;
  isActive: boolean;
};

export type InventoryRow = {
  id: number;
  sku: string;
  stock: number;
  lowStockAt: number;
  product: Product;
};

export type StoreSetting = {
  id: number;
  deliveryFee: string;
  freeDelivery: boolean;
  paymentMethodLabel: string;
  paymentProvider: string;
  homeHeroImageUrl?: string | null;
  homeStoryImageUrl?: string | null;
};

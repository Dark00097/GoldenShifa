import { CartItem, Product, ProductVariant } from '@/types';

export function activeVariants(product: Product) {
  return (product.variants || []).filter((variant) => variant.isActive !== false);
}

export function defaultVariant(product: Product) {
  if (product.disableBasePrice) return null;
  const variants = activeVariants(product);
  return variants.find((variant) => variant.isDefault) || variants[0] || null;
}

export function itemVariant(item: CartItem) {
  return item.variant || activeVariants(item.product).find((variant) => variant.id === item.variantId) || null;
}

export function selectedPrice(product: Product, variant?: ProductVariant | null) {
  return variant?.price || defaultVariant(product)?.price || product.price;
}

export function selectedCompareAt(product: Product, variant?: ProductVariant | null) {
  return variant?.compareAt || defaultVariant(product)?.compareAt || product.compareAt || null;
}

export function selectedWeight(product: Product, variant?: ProductVariant | null) {
  return variant?.label || defaultVariant(product)?.label || product.weight || null;
}

export function cartKey(productId: number, variantId?: number | null) {
  return `${productId}:${variantId || 'base'}`;
}

export function cartItemKey(item: CartItem) {
  return item.key || cartKey(item.product.id, item.variant?.id ?? item.variantId ?? null);
}

export function cartItemUnitPrice(item: CartItem) {
  return Number(item.unitPrice || selectedPrice(item.product, itemVariant(item)));
}

export function cartItemWeight(item: CartItem) {
  return item.weightLabel || selectedWeight(item.product, itemVariant(item));
}

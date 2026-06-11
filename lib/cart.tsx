'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { cartItemKey, cartItemUnitPrice, cartKey, defaultVariant, selectedPrice, selectedWeight } from '@/lib/product';
import { CartItem, Product, ProductVariant, StoreSetting } from '@/types';

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  couponCode: string;
  deliveryFee: number;
  total: number;
  loading: boolean;
  settings: StoreSetting | null;
  drawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant | null) => Promise<void> | void;
  updateQuantity: (key: string, quantity: number) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  applyCoupon: (code: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSetting | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('goldenshifa_cart');
    if (saved) {
      const parsed = JSON.parse(saved) as CartItem[];
      setItems(parsed.map((item) => ({ ...item, key: cartItemKey(item) })));
    }
    void refreshCart();
    apiFetch<{ settings: StoreSetting }>('/settings')
      .then((data) => setSettings(data.settings))
      .catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    localStorage.setItem('goldenshifa_cart', JSON.stringify(items));
  }, [items]);

  async function refreshCart() {
    setLoading(false);
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + cartItemUnitPrice(item) * item.quantity, 0);
    const deliveryFee = subtotal > 0 && !settings?.freeDelivery ? Number(settings?.deliveryFee ?? 7) : 0;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    return {
      items,
      count,
      subtotal,
      discount,
      couponCode,
      deliveryFee,
      total,
      loading,
      settings,
      drawerOpen,
      openCart() {
        setDrawerOpen(true);
      },
      closeCart() {
        setDrawerOpen(false);
      },
      addItem(product, quantity = 1, variant) {
        if (product.isComingSoon) return;
        const selectedVariant = variant === undefined ? defaultVariant(product) : variant;
        if (product.disableBasePrice && !selectedVariant) return;
        const key = cartKey(product.id, selectedVariant?.id ?? null);
        setItems((current) => {
          const existing = current.find((item) => cartItemKey(item) === key);
          if (!existing) {
            return [
              ...current,
              {
                key,
                product,
                variant: selectedVariant,
                variantId: selectedVariant?.id ?? null,
                weightLabel: selectedWeight(product, selectedVariant),
                unitPrice: selectedPrice(product, selectedVariant),
                quantity
              }
            ];
          }
          return current.map((item) =>
            cartItemKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item
          );
        });
        setDrawerOpen(true);
      },
      updateQuantity(key, quantity) {
        setItems((current) =>
          current
            .map((item) => (cartItemKey(item) === key ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      removeItem(key) {
        setItems((current) => current.filter((item) => cartItemKey(item) !== key));
      },
      clearCart() {
        setItems([]);
        setDiscount(0);
        setCouponCode('');
      },
      async applyCoupon(code) {
        if (!code.trim()) {
          setCouponCode('');
          setDiscount(0);
          return;
        }

        const data = await apiFetch<{ discount: number }>('/coupons/validate', {
          method: 'POST',
          data: { code, subtotal }
        });
        setCouponCode(code.toUpperCase());
        setDiscount(data.discount);
      },
      refreshCart
    };
  }, [couponCode, discount, drawerOpen, items, loading, settings]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart doit etre utilise dans CartProvider.');
  return context;
}

'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CartItem, Product, StoreSetting } from '@/types';

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
  addItem: (product: Product, quantity?: number) => Promise<void> | void;
  updateQuantity: (productId: number, quantity: number) => Promise<void> | void;
  removeItem: (productId: number) => Promise<void> | void;
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
    if (saved) setItems(JSON.parse(saved));
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
    const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
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
      addItem(product, quantity = 1) {
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (!existing) return [...current, { product, quantity }];
          return current.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        });
        setDrawerOpen(true);
      },
      updateQuantity(productId, quantity) {
        setItems((current) =>
          current
            .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      removeItem(productId) {
        setItems((current) => current.filter((item) => item.product.id !== productId));
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

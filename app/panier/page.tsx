'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { CouponInput } from '@/components/CouponInput';
import { EmptyState } from '@/components/EmptyState';
import { OrderSummary } from '@/components/OrderSummary';
import { QuantitySelector } from '@/components/QuantitySelector';
import { assetUrl, money } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { cartItemKey, cartItemUnitPrice, cartItemWeight } from '@/lib/product';

const fallback =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80';

export default function CartPage() {
  const { items, subtotal, discount, deliveryFee, total, updateQuantity, removeItem } = useCart();

  return (
    <main className="container-page py-10">
      <h1 className="font-display text-4xl font-bold text-deepHoney">Panier</h1>
      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Votre panier est vide" text="Ajoutez vos miels préférés pour préparer votre commande." actionHref="/produits" actionLabel="Voir les produits" />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {items.map((item) => {
              const key = cartItemKey(item);
              return (
              <div key={key} className="surface grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto]">
                <div className="relative aspect-square overflow-hidden rounded-md bg-cream">
                  <Image src={assetUrl(item.product.imageUrl || item.product.images?.[0]?.url) || fallback} alt={item.product.name} fill className="object-cover" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-deepHoney">{item.product.name}</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    {cartItemWeight(item) ? `${cartItemWeight(item)} · ` : ''}
                    {money(cartItemUnitPrice(item))}
                  </p>
                  <div className="mt-4">
                    <QuantitySelector value={item.quantity} onChange={(value) => updateQuantity(key, value)} />
                  </div>
                </div>
                <button className="btn-secondary h-10 px-3 text-red-700" onClick={() => removeItem(key)} aria-label="Supprimer">
                  <Trash2 size={16} />
                </button>
              </div>
            );
            })}
            <div className="surface p-5">
              <CouponInput />
            </div>
          </div>
          <div className="grid h-fit gap-4">
            <OrderSummary items={items} subtotal={subtotal} discount={discount} deliveryFee={deliveryFee} total={total} />
            <Link href="/checkout" className="btn-primary w-full">
              Passer au checkout
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

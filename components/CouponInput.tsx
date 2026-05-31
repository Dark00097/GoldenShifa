'use client';

import { FormEvent, useState } from 'react';
import { TicketPercent } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';

export function CouponInput() {
  const [code, setCode] = useState('');
  const { couponCode, discount, applyCoupon } = useCart();
  const toast = useToast();

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await applyCoupon(code);
      toast.success('Coupon appliqué.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Coupon invalide.');
    }
  }

  return (
    <form className="grid gap-2" onSubmit={submit}>
      <label className="flex items-center gap-2">
        <TicketPercent size={16} />
        Coupon
      </label>
      <div className="flex gap-2">
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="BIENVENUE10" />
        <button className="btn-secondary shrink-0" type="submit">
          Appliquer
        </button>
      </div>
      {couponCode && <p className="text-xs font-medium text-leaf">{couponCode} applique: remise {discount.toFixed(2)} EUR</p>}
    </form>
  );
}

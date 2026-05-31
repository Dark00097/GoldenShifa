// components/OrderSummary.tsx
import Image from 'next/image';
import { Package, ShoppingBag, Tag, Truck } from 'lucide-react';
import { assetUrl, money } from '@/lib/api';
import { CartItem } from '@/types';
import styles from './OrderSummary.module.css';

const fallbackImage =
  'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=300&q=80';

export function OrderSummary({
  items,
  subtotal,
  discount,
  deliveryFee,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}) {
  return (
    <aside className={styles.summary}>
      <div className={styles.summaryGlow} />

      <div className={styles.summaryHeader}>
        <span className={styles.summaryIcon}>
          <ShoppingBag size={15} />
        </span>
        <h2 className={styles.summaryTitle}>Résumé de commande</h2>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.product.id} className={styles.item}>
            <div className={styles.itemLeft}>
              <div className={styles.itemImageWrap}>
                <Image
                  src={assetUrl(item.product.imageUrl) || fallbackImage}
                  alt={item.product.name}
                  fill
                  className={styles.itemImage}
                  sizes="48px"
                />
                <span className={styles.itemQty}>{item.quantity}x</span>
              </div>
              <span className={styles.itemName}>{item.product.name}</span>
            </div>
            <strong className={styles.itemPrice}>
              {money(Number(item.product.price) * item.quantity)}
            </strong>
          </div>
        ))}
      </div>

      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span className={styles.totalRowIcon}>
            <Package size={13} />
          </span>
          <span className={styles.totalLabel}>Sous-total</span>
          <span className={styles.totalValue}>{money(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className={styles.totalRow}>
            <span className={styles.totalRowIcon}>
              <Tag size={13} />
            </span>
            <span className={styles.totalLabel}>Remise</span>
            <span className={`${styles.totalValue} ${styles.totalDiscount}`}>
              -{money(discount)}
            </span>
          </div>
        )}

        <div className={styles.totalRow}>
          <span className={styles.totalRowIcon}>
            <Truck size={13} />
          </span>
          <span className={styles.totalLabel}>Livraison</span>
          <span className={`${styles.totalValue} ${deliveryFee === 0 ? styles.totalFree : ''}`}>
            {deliveryFee === 0 ? 'Offerte' : money(deliveryFee)}
          </span>
        </div>
      </div>

      <div className={styles.grandTotal}>
        <div className={styles.grandTotalGlow} />
        <span className={styles.grandTotalLabel}>Total</span>
        <strong className={styles.grandTotalValue}>{money(total)}</strong>
      </div>
    </aside>
  );
}

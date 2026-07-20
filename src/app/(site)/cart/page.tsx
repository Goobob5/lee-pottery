'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import ProductPhoto from '@/components/ProductPhoto';
import { useCart } from '@/lib/cart-context';
import { useCatalog } from '@/lib/catalog-context';
import type { Product } from '@/lib/products';
import styles from './CartPage.module.css';

function redirectTo(url: string) {
  window.location.href = url;
}

export default function CartPage() {
  const { cartIds, removeFromCart } = useCart();
  const { products } = useCatalog();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const cartProducts = cartIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
  const subtotal = cartProducts.reduce((sum, p) => sum + p.price, 0);
  const total = subtotal + (cartProducts.length ? 25 : 0);

  async function handleCheckout() {
    setError('');
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: cartProducts.map((p) => p.id), newsletterOptIn }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout');
      redirectTo(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong starting checkout.');
      setCheckingOut(false);
    }
  }

  return (
    <div className={styles.page} data-screen-label="Cart">
      <div className={styles.inner}>
        <h1 className={styles.title}>Your cart</h1>

        {cartProducts.length === 0 ? (
          <div className={styles.empty}>
            <Image src="/images/brand/crocodile-single.png" alt="" width={390} height={164} className={styles.emptyIcon} />
            <p className={styles.emptyText}>Nothing in here yet — the shelf, on the other hand, is full.</p>
            <Link href="/collection">
              <Button>See the collection</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.holdNote}>One-of-a-kind pieces are held for you for 30 minutes.</p>
            <div className={styles.itemsList}>
              {cartProducts.map((p) => (
                <div key={p.id} className={styles.item}>
                  <div className={styles.itemPhoto}>
                    <ProductPhoto product={p} sizes="110px" />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{p.name}</span>
                    <span className={styles.itemMeta}>{p.meta}</span>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(p.id)}>Remove</button>
                  </div>
                  <span className={styles.itemPrice}>${p.price}</span>
                </div>
              ))}
              <div className={styles.summaryRow}>
                <span>Shipping — packed by me, insured</span>
                <span>$25</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>${total}</span>
              </div>
              {error && <span className={styles.errorMsg}>{error}</span>}
              <label className={styles.newsletterOptIn}>
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                />
                <span>Notify me about future kiln drops — first look when new work lands.</span>
              </label>
              <div className={styles.actions}>
                <Button size="lg" onClick={handleCheckout} disabled={checkingOut}>
                  {checkingOut ? 'Redirecting…' : 'Check out'}
                </Button>
                <Link href="/collection">
                  <Button variant="ghost" size="lg">Keep browsing</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

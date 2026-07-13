'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart-context';

/** Fires once on mount to empty the cart after a confirmed Stripe payment. */
export default function ClearCart() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

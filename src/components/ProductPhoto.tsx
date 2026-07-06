import Image from 'next/image';
import type { Product } from '@/lib/products';
import styles from './ProductPhoto.module.css';

type ProductPhotoProps = {
  product: Product;
  height?: string;
  aspectRatio?: string;
  shape?: 'rect' | 'circle' | 'rounded';
  radius?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/** Renders the product's real photo if one has been supplied, otherwise a
 * labeled placeholder frame so missing photography is obvious, not silently blank. */
export default function ProductPhoto({
  product,
  height,
  aspectRatio,
  shape = 'rect',
  radius,
  sizes = '(max-width: 760px) 50vw, 33vw',
  priority = false,
  className,
}: ProductPhotoProps) {
  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? `${radius ?? 8}px` : undefined;
  const style: React.CSSProperties = { height, aspectRatio, borderRadius };

  if (product.image) {
    return (
      <div className={[styles.wrap, className].filter(Boolean).join(' ')} style={style}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.img}
        />
      </div>
    );
  }

  return (
    <div className={[styles.placeholder, className].filter(Boolean).join(' ')} style={style}>
      <span className={styles.placeholderName}>{product.name}</span>
      <span className={styles.placeholderNote}>Photo coming soon</span>
    </div>
  );
}

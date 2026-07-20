import { notFound } from 'next/navigation';
import { getProductById, hasDb } from '@/lib/db';
import ProductForm from '../../ProductForm';
import styles from '../../../../admin.module.css';

export default async function DuplicateProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasDb()) notFound();
  const piece = await getProductById(id);
  if (!piece) notFound();

  return (
    <>
      <h1 className={styles.title}>Duplicate: {piece.name}</h1>
      <p className={styles.subtitle}>
        A fresh copy — everything is carried over except the stock count. Swap the photos and
        tweak anything else, then save it as a new piece. The original is left untouched.
      </p>
      <ProductForm piece={piece} duplicate />
    </>
  );
}

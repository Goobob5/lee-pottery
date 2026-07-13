import { notFound } from 'next/navigation';
import { getProductById, hasDb } from '@/lib/db';
import ProductForm from '../ProductForm';
import styles from '../../../admin.module.css';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasDb()) notFound();
  const piece = await getProductById(id);
  if (!piece) notFound();

  return (
    <>
      <h1 className={styles.title}>{piece.name}</h1>
      <ProductForm piece={piece} />
    </>
  );
}

import ProductForm from '../ProductForm';
import styles from '../../../admin.module.css';

export default function NewProductPage() {
  return (
    <>
      <h1 className={styles.title}>Add a piece</h1>
      <ProductForm />
    </>
  );
}

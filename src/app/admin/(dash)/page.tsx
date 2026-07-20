import Image from 'next/image';
import Link from 'next/link';
import { hasDb, listProducts, type AdminProduct } from '@/lib/db';
import { PRODUCTS, FILTER_TYPES } from '@/lib/products';
import { changeStockAction, markSoldInPersonAction } from '@/lib/admin-actions';
import ConfirmButton from '../ConfirmButton';
import styles from '../admin.module.css';

function fallbackPieces(): AdminProduct[] {
  return PRODUCTS.map((p) => ({
    ...p,
    stock: p.sold ? 0 : p.stock ?? 1,
    reservedUntil: null,
    soldAt: null,
    soldChannel: null,
  }));
}

function statusFor(p: AdminProduct): { label: string; className: string } {
  if (p.stock <= 0) {
    const channel = p.soldChannel === 'in-person' ? 'at market' : p.soldChannel === 'online' ? 'online' : '';
    return { label: ['Sold', channel].filter(Boolean).join(' '), className: 'badgeSold' };
  }
  if (p.oneOfAKind && p.reservedUntil && new Date(p.reservedUntil) > new Date()) {
    // Rendered on the server (UTC on Vercel) — pin to Sydney time explicitly.
    const until = new Date(p.reservedUntil).toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Australia/Sydney',
    });
    return { label: `In a buyer's checkout until ${until}`, className: 'badgeReserved' };
  }
  return {
    label: p.oneOfAKind ? 'Available' : `${p.stock} left`,
    className: 'badgeAvailable',
  };
}

export default async function AdminPiecesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const dbMode = hasDb();
  const all = dbMode ? await listProducts() : fallbackPieces();

  const { type } = await searchParams;
  const activeType = (FILTER_TYPES as readonly string[]).includes(type ?? '') ? type! : 'All';
  const pieces = activeType === 'All' ? all : all.filter((p) => p.type === activeType);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div>
          <h1 className={styles.title}>Pieces</h1>
          <p className={styles.subtitle}>
            Sold something at the stall? Set the price it went for, tap “Sold at market”, and it comes
            off the site straight away.
          </p>
        </div>
        {dbMode && (
          <Link href="/admin/products/new" className={styles.btn} style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
            + Add a piece
          </Link>
        )}
      </div>

      <div className={styles.filters}>
        {FILTER_TYPES.map((label) => {
          const href = label === 'All' ? '/admin' : `/admin?type=${encodeURIComponent(label)}`;
          return (
            <Link
              key={label}
              href={href}
              className={`${styles.filterChip} ${activeType === label ? styles.filterChipActive : ''}`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className={styles.card}>
        {pieces.map((p) => {
          const status = statusFor(p);
          return (
            <div key={p.id} className={styles.pieceRow}>
              {p.image ? (
                <Image src={p.image} alt={p.name} width={56} height={56} className={styles.thumb} />
              ) : (
                <div className={styles.thumbEmpty}>no photo</div>
              )}
              <div className={styles.pieceInfo}>
                {dbMode ? (
                  <Link href={`/admin/products/${p.id}`} className={styles.pieceName}>{p.name}</Link>
                ) : (
                  <span className={styles.pieceName}>{p.name}</span>
                )}
                <span className={styles.pieceMeta}>
                  ${p.price} · {p.type} · {p.oneOfAKind ? 'One of a kind' : p.batch || 'Batch'}
                </span>
                <span className={`${styles.badge} ${styles[status.className]}`}>{status.label}</span>
              </div>
              {dbMode && (
                <div className={styles.pieceActions}>
                  {p.stock > 0 ? (
                    <>
                      <form action={markSoldInPersonAction} className={styles.sellForm}>
                        <input type="hidden" name="id" value={p.id} />
                        <label className={styles.priceField}>
                          <span className={styles.pricePrefix}>$</span>
                          <input
                            type="number"
                            name="price"
                            defaultValue={p.price}
                            step="1"
                            min="0"
                            inputMode="decimal"
                            className={styles.priceInput}
                            aria-label={`Sale price for ${p.name}`}
                          />
                        </label>
                        <ConfirmButton
                          message={`Mark one “${p.name}” as sold at the market? It comes off the website immediately.`}
                          className={`${styles.btn} ${styles.btnSmall}`}
                        >
                          Sold at market
                        </ConfirmButton>
                      </form>
                      {!p.oneOfAKind && (
                        <div className={styles.actionRow}>
                          <form action={changeStockAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="delta" value="1" />
                            <button type="submit" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}>+1</button>
                          </form>
                          <form action={changeStockAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="delta" value="-1" />
                            <button type="submit" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}>−1</button>
                          </form>
                        </div>
                      )}
                    </>
                  ) : (
                    <form action={changeStockAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value="1" />
                      <button type="submit" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}>
                        Back on the shelf
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/admin/products/${p.id}/duplicate`}
                    className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Duplicate
                  </Link>
                </div>
              )}
            </div>
          );
        })}
        {pieces.length === 0 && (
          <div className={styles.emptyState}>
            {activeType === 'All'
              ? 'No pieces yet — add your first one.'
              : `No ${activeType.toLowerCase()} to show.`}
          </div>
        )}
      </div>
    </>
  );
}

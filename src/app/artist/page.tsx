import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import styles from './ArtistPage.module.css';

export const metadata = {
  title: 'The artist — Lee Pottery',
};

export default function ArtistPage() {
  return (
    <div data-screen-label="Artist">
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>The artist</h1>
        <p className={styles.heroSub}>
          Richard Lee, a Sydney ceramicist making sculpture and tableware drawn from the harbour and its estuaries.
        </p>
      </section>

      {/* Third-person introduction to the maker and the practice */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <span className={styles.eyebrow}>About Richard Lee</span>
          <p className={styles.introLead}>
            Richard Lee is a ceramicist working from a small studio in Sydney, a short walk from the water. He
            throws sculpture and tableware in speckled stoneware, then brushes each piece with the swans, crabs
            and crocodiles of the waterways around him — always in a single cobalt.
          </p>
          <p className={styles.introBody}>
            Working alone at one wheel and one kiln, he makes every piece by hand and fires each one twice.
            Nothing is mass-produced and nothing is repeated exactly; each work leaves the studio as its own
            object. His practice moves between functional tableware for everyday use and one-off sculptural
            pieces, and he takes a small number of commissions and exhibitions each year.
          </p>
        </div>
      </section>

      <section className={styles.words}>
        <div className={styles.wordsPhoto}>
          <Image src="/images/studio/studio-wide.webp" alt="Wide studio photo — wheel, shelves of work" fill sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.wordsText}>
          <span className={styles.eyebrow}>In his words</span>
          <h2 className={styles.wordsHeading}>I&rsquo;m Richard. I make pots about the harbour.</h2>
          <p className={styles.wordsBody}>
            Every piece starts as a bag of speckled stoneware and ends up carrying an animal I&rsquo;ve watched —
            swans at Rozelle Bay, crabs in the mangroves, and the odd crocodile from trips further north. I throw
            one piece at a time, brush the drawings on in cobalt, and fire each one twice.
          </p>
          <p className={styles.wordsBody}>
            Nothing here is factory-made and nothing is repeated exactly. If a piece speaks to you, it&rsquo;s the
            only one of its kind in the world.
          </p>
          <span className={styles.signature}>Richard</span>
        </div>
      </section>

      <section className={styles.process}>
        <div className={styles.processItem}>
          <div className={`${styles.processPhoto} ${styles.processPlaceholder}`}>Photo coming soon</div>
          <span className={styles.processLabel}>Thrown</span>
          <span className={styles.processDesc}>Each form is thrown in one sitting, while the clay is willing.</span>
        </div>
        <div className={styles.processItem}>
          <div className={styles.processPhoto}>
            <Image src="/images/studio/process-drawn.webp" alt="Brushing cobalt illustration" fill sizes="(max-width: 760px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
          </div>
          <span className={styles.processLabel}>Drawn</span>
          <span className={styles.processDesc}>The animals go on loose and quick, in cobalt, before the glaze firing.</span>
        </div>
        <div className={styles.processItem}>
          <div className={`${styles.processPhoto} ${styles.processPlaceholder}`}>Photo coming soon</div>
          <span className={styles.processLabel}>Fired</span>
          <span className={styles.processDesc}>Two firings, up to 1,280°. What comes out is always a small surprise.</span>
        </div>
      </section>

      <section className={styles.commission}>
        <p className={styles.commissionText}>Have something particular in mind? I take a small number of commissions each season.</p>
        <Link href="/enquire">
          <Button>Start a conversation</Button>
        </Link>
      </section>
    </div>
  );
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import { TOPICS } from '@/lib/products';
import styles from './EnquirePage.module.css';

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

function EnquireForm() {
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // One-time prefill from the URL (deep-linked from the piece modal / lookbook
    // CTA), not derivable as a lazy initial state since useSearchParams needs Suspense.
    /* eslint-disable react-hooks/set-state-in-effect */
    const topicParam = searchParams.get('topic');
    if (topicParam && (TOPICS as readonly string[]).includes(topicParam)) {
      setTopic(topicParam);
    }
    const similar = searchParams.get('similar');
    if (similar) {
      setMessage((prev) => prev || `I'm interested in a piece similar to "${similar}".`);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitEnquiry() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('A name, an email and a few words — that’s all I need.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('That email doesn’t look quite right — mind checking it?');
      return;
    }
    if (!FORMSPREE_ENDPOINT) {
      setError('This form isn’t connected yet — set NEXT_PUBLIC_FORMSPREE_ENDPOINT in your environment.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, topic }),
      });
      if (!res.ok) throw new Error('Request failed');
      setSent(true);
      window.scrollTo(0, 0);
    } catch {
      setError('That didn’t send — mind trying again in a moment?');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className={styles.layout}>
      <div className={styles.intro}>
        <h1 className={styles.title}>Say hello</h1>
        <p className={styles.leadText}>
          Commissions, stocking my work, a market invitation, or a question about a piece — write to me here and
          I&rsquo;ll reply within a few days.
        </p>
        <p className={styles.subText}>
          I take a small number of commissions each season — dinner sets, one-off sculptural pieces, and gifts
          with a story behind them.
        </p>
        <Image src="/images/brand/crocodile-single.png" alt="" width={200} height={200} className={styles.croc} />
      </div>

      {!sent ? (
        <div className={styles.formCard}>
          <div className={styles.field}>
            <label className={styles.label}>What&rsquo;s this about?</label>
            <div className={styles.topicRow}>
              {TOPICS.map((label) => (
                <button
                  key={label}
                  className={`${styles.topicChip} ${topic === label ? styles.active : ''}`}
                  onClick={() => setTopic(label)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Your name</label>
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Chen" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tell me what you have in mind</label>
            <textarea
              className={styles.textarea}
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A dinner set for six, something with swans… or the dates and location of your market."
            />
          </div>

          {error && <span className={styles.errorMsg}>{error}</span>}

          <div className={styles.submitRow}>
            <Button size="lg" onClick={submitEnquiry} disabled={sending}>
              {sending ? 'Sending…' : 'Send it my way'}
            </Button>
            <span className={styles.submitNote}>Goes straight to my inbox — no address harvested, no newsletter.</span>
          </div>
        </div>
      ) : (
        <div className={styles.successCard}>
          <Image src="/images/brand/swan-single.png" alt="" width={80} height={80} className={styles.successSwan} />
          <h2 className={styles.successTitle}>Got it — thank you.</h2>
          <p className={styles.successBody}>
            I read every message myself, usually at the end of a studio day. You&rsquo;ll hear back from me within
            a few days.
          </p>
          <span className={styles.signature}>Richard</span>
          <Link href="/collection">
            <Button variant="secondary">Back to the collection</Button>
          </Link>
        </div>
      )}
    </section>
  );
}

export default function EnquirePage() {
  return (
    <div className={styles.page} data-screen-label="Enquire">
      <Suspense fallback={null}>
        <EnquireForm />
      </Suspense>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import styles from './NewsletterPopup.module.css';

const STORAGE_KEY = 'lp_newsletter_seen';
const REMEMBER_DAYS = 30;
const OPEN_DELAY_MS = 5000;

/** True once the visitor has dismissed or joined within the remember window. */
function recentlySeen(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const seenAt = Number(raw);
    if (!Number.isFinite(seenAt)) return false;
    return Date.now() - seenAt < REMEMBER_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Private mode / storage disabled — worst case the popup shows again later.
  }
}

/**
 * Home-page invitation to the kiln-drop newsletter. Appears once — after a
 * short delay or on exit intent — then stays gone for a month whether the
 * visitor joins or dismisses it. Capture only; no email is sent from here.
 */
export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    rememberSeen();
    setOpen(false);
  }, []);

  // Arm the triggers once per visit, and only if they haven't seen it lately.
  useEffect(() => {
    if (recentlySeen()) return;

    let armed = true;
    const show = () => {
      if (!armed) return;
      armed = false;
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onMouseOut);
      setOpen(true);
    };
    const timer = window.setTimeout(show, OPEN_DELAY_MS);
    // Exit intent: cursor leaves through the top of the viewport.
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) show();
    };
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      armed = false;
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  // While open: focus the field, close on Esc, and keep focus inside the dialog.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('That email doesn’t look quite right — mind checking it?');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not sign you up.');
      rememberSeen();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={close}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={close} aria-label="Close">
          &times;
        </button>
        <Image
          src="/images/brand/swan-single.png"
          alt=""
          width={433}
          height={244}
          className={styles.art}
        />
        {!done ? (
          <>
            <span className={styles.kicker}>Kiln drops</span>
            <h2 id="newsletter-heading" className={styles.heading}>
              First look when the kiln opens
            </h2>
            <p className={styles.body}>
              I fire in small batches. Leave your email and I&rsquo;ll tell you the moment new
              pieces land — before they reach the shelf.
            </p>
            <form className={styles.form} onSubmit={submit} noValidate>
              <label htmlFor="newsletter-email" className={styles.srOnly}>
                Email address
              </label>
              <input
                ref={inputRef}
                id="newsletter-email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {error && <span className={styles.error}>{error}</span>}
              <Button size="md" type="submit" disabled={submitting}>
                {submitting ? 'Signing you up…' : 'Notify me about kiln drops'}
              </Button>
            </form>
            <p className={styles.finePrint}>
              No spam — just kiln drops. Unsubscribe any time. See our{' '}
              <Link href="/enquire" className={styles.privacyLink}>
                privacy note
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <span className={styles.kicker}>You&rsquo;re on the list</span>
            <h2 id="newsletter-heading" className={styles.heading}>
              Thank you — I&rsquo;ll be in touch
            </h2>
            <p className={styles.body}>
              You&rsquo;ll hear from me the next time the kiln opens.
            </p>
            <span className={styles.signature}>Richard</span>
            <Button variant="secondary" size="md" onClick={close}>
              Keep browsing
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import styles from '../../admin.module.css';

/**
 * Get the list out: a one-click CSV download (for a spreadsheet or a real ESP
 * later) and a copy-all-emails button for pasting straight into Gmail's Bcc.
 */
export default function NewsletterTools({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);

  async function copyEmails() {
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (emails.length === 0) return null;

  return (
    <div className={styles.newsletterTools}>
      <a
        href="/api/admin/newsletter-export"
        className={`${styles.btn} ${styles.btnSmall}`}
        download
      >
        Download CSV
      </a>
      <button
        type="button"
        onClick={copyEmails}
        className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
      >
        {copied ? 'Copied!' : 'Copy all emails'}
      </button>
    </div>
  );
}

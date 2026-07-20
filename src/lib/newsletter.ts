import { z } from 'zod';

/**
 * One place to define what a valid newsletter email looks like, shared by the
 * public sign-up route and any server-side opt-in (e.g. the checkout box).
 * Zod does the shape check; we normalise to a trimmed, lowercased address so
 * the database's UNIQUE constraint dedupes case-insensitively.
 */
const emailSchema = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
  z.email().max(320),
);

export function parseEmail(input: unknown): string | null {
  const result = emailSchema.safeParse(input);
  return result.success ? result.data : null;
}

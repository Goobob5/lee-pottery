type ScheduleEntry = {
  status: string;
  label: string;
  detail: string;
  /** Marks the entry the "Next market" banner and drawer should point at.
   * Set it on the next dated market; clear it once that market has passed and
   * the recurring Kirribilli line becomes the honest answer again. */
  next?: boolean;
};

export const SCHEDULE: ScheduleEntry[] = [
  { status: 'Every fourth Saturday', label: 'Kirribilli Markets', detail: 'Monthly · Bradfield Park, Milsons Point' },
  { status: 'Sep 18–20', label: 'Big Design Market', detail: 'Come find my stall · Sydney', next: true },
  { status: 'Open now', label: 'Commissions', detail: 'A few slots open this season' },
];

/** Short one-line summary of the next market, used in the mobile market banner
 * and drawer. Prefers the entry flagged `next` — a dated market outranks the
 * recurring one — and keeps each label's own capitalisation. */
const nextMarket = SCHEDULE.find((e) => e.next) ?? SCHEDULE[0];
export const MARKET_LINE = `${nextMarket.label}, ${nextMarket.status}`;

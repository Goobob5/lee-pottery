export const SCHEDULE = [
  { status: 'Every fourth Saturday', label: 'Kirribilli Markets', detail: 'Monthly · Bradfield Park, Milsons Point' },
  { status: 'Sep 18–20', label: 'Big Design Market', detail: 'Come find my stall · Sydney' },
  { status: 'Open now', label: 'Commissions', detail: 'A few slots open this season' },
];

/** Short one-line summary of the next market, used in the mobile market banner and drawer. */
export const MARKET_LINE = `${SCHEDULE[0].label}, ${SCHEDULE[0].status.toLowerCase()}`;

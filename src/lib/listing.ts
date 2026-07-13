/**
 * The shape of an AI-drafted listing. Kept free of `zod` and server imports so
 * the review form (a client component) can use the type without pulling the
 * drafting machinery into the browser bundle. The matching zod schema lives in
 * the drafting route (`/api/draft-listing`).
 */
export type ListingDraft = {
  /** Piece name in Richard's naming style, e.g. "Estuary bowl". */
  name: string;
  /** One of the catalog types (Bowls, Mugs, …) — never "All". */
  type: string;
  /** Short card line under the name, e.g. "Speckled stoneware · 21 cm". */
  meta: string;
  /** Size line, e.g. "21 cm across, 9 cm deep". */
  dims: string;
  /** Clay & glaze line. */
  material: string;
  /** The listing description. */
  desc: string;
  /** The personal note signed "Richard" — his voice. */
  note: string;
  /** One alt-text per photo, in the same order as the photos sent. */
  altTexts: string[];
  /** Index (0-based) of the photo that should lead the listing. */
  suggestedHeroIndex: number;
};

/** The facts Richard types on the new-piece screen, handed to the drafter. */
export type PieceFacts = {
  dims: string;
  weight: string;
  capacity: string;
  material: string;
  kind: 'one-off' | 'batch' | 'repeatable';
  story: string;
};

export type Product = {
  id: string;
  name: string;
  type: string;
  price: number;
  oneOfAKind: boolean;
  batch?: string;
  sold: boolean;
  /** Path under /public, or null if no photo has been supplied yet. */
  image: string | null;
  meta: string;
  dims: string;
  material: string;
  desc: string;
  note: string;
};

// Placeholder catalog — swap in the real range, prices and photos when ready.
// Five pieces already have real photos (supplied during the design session);
// the rest render as labeled placeholder frames until photos are added.
export const PRODUCTS: Product[] = [
  {
    id: 'swan-platter-3', name: 'Swan platter no. 3', type: 'Platters', price: 420,
    oneOfAKind: true, sold: false, image: '/images/products/swan-platter-3.webp',
    meta: 'Stoneware, cobalt on white glaze · 38 cm', dims: '38 cm across', material: 'Speckled stoneware, cobalt brushwork',
    desc: 'A wide serving platter in speckled stoneware, two swans brushed in cobalt across the well.',
    note: 'Thrown in one sitting; the swans took longer. I watched them at Rozelle Bay the morning I glazed this.',
  },
  {
    id: 'estuary-bowl', name: 'Estuary bowl', type: 'Bowls', price: 260,
    oneOfAKind: true, sold: false, image: '/images/products/estuary-bowl.webp',
    meta: 'Speckled stoneware, unglazed rim · 21 cm', dims: '21 cm across, 9 cm deep', material: 'Speckled stoneware, unglazed rim',
    desc: 'A generous everyday bowl — the glaze pools blue-grey at the bottom like low tide.',
    note: 'The rim is left bare so you can feel the clay it came from.',
  },
  {
    id: 'mangrove-vase', name: 'Mangrove vase', type: 'Vases', price: 540,
    oneOfAKind: true, sold: false, image: '/images/products/mangrove-vase.webp',
    meta: 'Sculptural, one of a kind · 34 cm', dims: '34 cm tall', material: 'Stoneware, layered cobalt wash',
    desc: 'A tall sculptural vase with roots of cobalt climbing the body — happiest holding one dramatic branch.',
    note: 'Built from the mangrove sketches in my notebook — the roots wrapped themselves around it.',
  },
  {
    id: 'harbour-bottle', name: 'Harbour bottle, tall', type: 'Bottles', price: 380,
    oneOfAKind: true, sold: true, image: '/images/products/harbour-bottle.webp',
    meta: 'Sold — enquire about a similar piece', dims: '31 cm tall', material: 'Stoneware, white glaze',
    desc: 'A narrow-necked bottle with a single swan circling the shoulder.',
    note: 'This one went to a kitchen in Marrickville. I can throw you a cousin.',
  },
  {
    id: 'crocodile-mugs', name: 'Crocodile mug pair', type: 'Mugs', price: 140,
    oneOfAKind: false, batch: 'Small batch of six', sold: false, image: '/images/products/crocodile-mugs.webp',
    meta: 'Small batch of six · 350 ml', dims: '350 ml each', material: 'Speckled stoneware, cobalt brushwork',
    desc: 'Two mugs, two crocodiles — one grinning, one napping. Sold as a pair.',
    note: 'The crocodiles are from a trip up north. They behave in the dishwasher.',
  },
  {
    id: 'dinner-plates', name: 'Dinner plates, set of four', type: 'Plates', price: 320,
    oneOfAKind: false, batch: 'Limited run', sold: false, image: null,
    meta: 'Limited run · 27 cm', dims: '27 cm each', material: 'Speckled stoneware, clear glaze',
    desc: 'Four dinner plates with a different harbour bird on each — no two settings alike.',
    note: 'Set the table and your guests will argue over who gets the swan.',
  },
  {
    id: 'crab-dish', name: 'Crab dish, small', type: 'Plates', price: 95,
    oneOfAKind: true, sold: false, image: null,
    meta: 'One of a kind · 14 cm', dims: '14 cm across', material: 'Stoneware, cobalt brushwork',
    desc: 'A little dish for salt, rings or olive pits — one crab, mid-scuttle.',
    note: 'Drawn from the crabs under the mangrove boardwalk. He is going somewhere important.',
  },
  {
    id: 'tidal-bowl', name: 'Tidal bowl, wide', type: 'Bowls', price: 310,
    oneOfAKind: true, sold: false, image: null,
    meta: 'One of a kind · 28 cm', dims: '28 cm across, 7 cm deep', material: 'Speckled stoneware, layered wash',
    desc: 'A shallow, wide bowl — the cobalt wash breaks across it like a falling tide.',
    note: 'I let the wash run where it wanted on this one. It knew best.',
  },
  {
    id: 'milk-bottle', name: 'Milk bottle, cobalt drip', type: 'Bottles', price: 220,
    oneOfAKind: false, batch: 'Small batch', sold: false, image: null,
    meta: 'Small batch · 19 cm', dims: '19 cm tall, 500 ml', material: 'Stoneware, dipped cobalt rim',
    desc: 'A stout little bottle for milk, dressing or a single stem — dipped rim, honest form.',
    note: 'The drip is different on every one. Yours will be yours.',
  },
  {
    id: 'swan-mug', name: 'Swan mug', type: 'Mugs', price: 85,
    oneOfAKind: false, batch: 'Small batch', sold: false, image: null,
    meta: 'Small batch · 300 ml', dims: '300 ml', material: 'Speckled stoneware, cobalt brushwork',
    desc: 'A morning mug with a swan gliding around it. The handle sits just right.',
    note: 'I make a few of these every firing and they always go first.',
  },
  {
    id: 'oyster-platter', name: 'Oyster platter', type: 'Platters', price: 460,
    oneOfAKind: true, sold: false, image: null,
    meta: 'One of a kind · 42 cm', dims: '42 cm across', material: 'Stoneware, unglazed underside',
    desc: 'A long serving platter with a shoreline of brushwork down one edge — built for a dozen oysters and a lemon.',
    note: 'Made with a table full of friends in mind.',
  },
  {
    id: 'cockatoo-vase', name: 'Bird bottle no. 2', type: 'Vases', price: 480,
    oneOfAKind: true, sold: true, image: null,
    meta: 'Sold — enquire about a similar piece', dims: '29 cm tall', material: 'Stoneware, cobalt brushwork',
    desc: 'A round-bellied vase, one bird taking off around the shoulder.',
    note: 'Sold at my last market before lunch. There will be a no. 3.',
  },
];

export const FILTER_TYPES = ['All', 'Bowls', 'Mugs', 'Plates', 'Vases', 'Bottles', 'Platters'] as const;
export const TOPICS = ['A commission', 'Stocking my work', 'A market or exhibition', 'Something else'] as const;

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

function numberIn(re: RegExp, str: string): number | null {
  const m = str.match(re);
  return m ? parseInt(m[1], 10) : null;
}

/** Largest real dimension in cm (mugs given in ml are treated as small). */
export function sizeOf(p: Product): number {
  const cm = numberIn(/(\d+)\s*cm/, p.dims);
  if (cm != null) return cm;
  if (/ml/.test(p.dims)) return 11;
  return 20;
}

/** Visual weight: 2 = pale/white glaze, 3 = speckled mid, 4 = deep cobalt wash. */
export function toneOf(p: Product): number {
  const t = (p.material + ' ' + p.desc).toLowerCase();
  if (/white glaze|clear glaze|cobalt on white/.test(t)) return 2;
  if (/layered|wash|dark/.test(t)) return 4;
  return 3;
}

export type Recommendation = { label: string; product: Product };

/** Contextual "what next" — a lighter/deeper piece, a larger/smaller one, and something different. */
export function recommendationsFor(all: Product[], cur: Product): Recommendation[] {
  const pool = all.filter((p) => p.id !== cur.id);
  const curSize = sizeOf(cur);
  const curTone = toneOf(cur);
  const prefAvail = (arr: Product[]) => {
    const a = arr.filter((x) => !x.sold);
    return a.length ? a : arr;
  };
  const first = (arr: Product[]) => (arr.length ? arr[0] : null);
  const bySizeGap = (a: Product, b: Product) => Math.abs(sizeOf(a) - curSize) - Math.abs(sizeOf(b) - curSize);

  const lighter = first(prefAvail(pool.filter((p) => toneOf(p) < curTone)).sort(bySizeGap));
  const deeper = first(prefAvail(pool.filter((p) => toneOf(p) > curTone)).sort(bySizeGap));
  const larger = first(prefAvail(pool.filter((p) => sizeOf(p) > curSize)).sort((a, b) => sizeOf(a) - sizeOf(b)));
  const smaller = first(prefAvail(pool.filter((p) => sizeOf(p) < curSize)).sort((a, b) => sizeOf(b) - sizeOf(a)));

  const out: Recommendation[] = [];
  const add = (label: string, p: Product | null) => {
    if (p && !out.some((o) => o.product.id === p.id)) out.push({ label, product: p });
  };
  if (lighter) add('Something lighter', lighter);
  else add('Something deeper', deeper);
  if (larger) add('Something larger', larger);
  else add('Something smaller', smaller);

  const chosen = new Set(out.map((o) => o.product.id));
  const diffType = prefAvail(pool.filter((p) => !chosen.has(p.id) && p.type !== cur.type));
  const other = first(diffType) || first(prefAvail(pool.filter((p) => !chosen.has(p.id))));
  add('Something else', other);

  return out.slice(0, 3);
}

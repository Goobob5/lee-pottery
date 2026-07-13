import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod/v4';
import sharp from 'sharp';
import { isAdmin } from '@/lib/admin-auth';
import { readFile } from '@/lib/storage';
import { hasDb, listProducts } from '@/lib/db';
import { FILTER_TYPES, PRODUCTS, type Product } from '@/lib/products';
import type { PieceFacts } from '@/lib/listing';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-opus-4-8';
const TYPES = FILTER_TYPES.filter((t) => t !== 'All');

export function hasAnthropic(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function draftSchema(photoCount: number) {
  return z.object({
    name: z.string().describe("The piece's name in Richard's naming style, e.g. 'Estuary bowl' or 'Swan platter no. 3'."),
    type: z
      .enum(TYPES as [string, ...string[]])
      .describe('The single best-fitting catalog type.'),
    meta: z.string().describe("Short card line under the name, e.g. 'Speckled stoneware, unglazed rim · 21 cm'. Empty string if unsure."),
    dims: z.string().describe('Size line from the measurements given, e.g. \'21 cm across, 9 cm deep\'. Empty string if not provided.'),
    material: z.string().describe('Clay & glaze line. Only what is visible or stated. Empty string if unknown.'),
    desc: z.string().describe('The listing description — one or two honest sentences about the piece.'),
    note: z.string().describe("The personal note signed 'Richard' on the piece page, in his voice. Empty string if you have nothing true to say."),
    altTexts: z
      .array(z.string())
      .length(photoCount)
      .describe(`Alt text for each photo, exactly ${photoCount}, in order.`),
    suggestedHeroIndex: z
      .number()
      .int()
      .min(0)
      .max(Math.max(0, photoCount - 1))
      .describe('Index of the photo that should lead the listing (the strongest three-quarter or front shot).'),
  });
}

/** A few real catalog entries so the model can match Richard's voice. */
function voiceExample(p: Product) {
  return { name: p.name, type: p.type, meta: p.meta, dims: p.dims, material: p.material, desc: p.desc, note: p.note };
}

async function fewShotExamples(): Promise<Product[]> {
  const source = hasDb() ? await listProducts() : PRODUCTS;
  return source.filter((p) => p.note && p.desc).slice(0, 4);
}

const SYSTEM = `You are drafting product listings for Lee Pottery, a one-person ceramics studio in Sydney run by Richard Lee. You write in Richard's voice and only about what is actually there.

Voice (especially the "note", which is signed "Richard" on the site):
- Dry, warm, first person. Quietly confident, never salesy — no "stunning", "perfect for", "must-have".
- Grounded in Sydney harbour life: mangroves, tides, Rozelle Bay, markets, the birds and creatures he draws.
- Plain, tactile language about clay, glaze, throwing and firing.

Hard rules:
- Never invent facts not visible in the photos or stated by Richard. No fictional glazes, capacities, or backstories.
- If you don't know a field, leave it as an empty string rather than guessing.
- Do not write a price — that is Richard's alone.
- Everything you draft is a starting point Richard reviews and edits before publishing.`;

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }
  if (!hasAnthropic()) {
    // Fail closed but let the flow continue with an empty draft.
    return NextResponse.json({ draft: null, error: 'ANTHROPIC_API_KEY is not set.' }, { status: 200 });
  }

  const body = (await request.json()) as { photos?: unknown; facts?: Partial<PieceFacts> };
  const photos = Array.isArray(body.photos) ? body.photos.filter((u): u is string => typeof u === 'string') : [];
  const facts = body.facts ?? {};
  if (photos.length === 0) {
    return NextResponse.json({ draft: null, error: 'No photos to describe.' }, { status: 200 });
  }

  try {
    // Downscale each processed photo to ~1100 px for the API call to keep
    // image tokens down — the model doesn't need the full 2000 px version.
    const imageBlocks = await Promise.all(
      photos.map(async (url) => {
        const bytes = await readFile(url);
        const small = await sharp(bytes)
          .resize(1100, 1100, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        return {
          type: 'image' as const,
          source: { type: 'base64' as const, media_type: 'image/webp' as const, data: small.toString('base64') },
        };
      }),
    );

    const examples = await fewShotExamples();
    const factLines = [
      facts.dims && `Size: ${facts.dims}`,
      facts.weight && `Weight: ${facts.weight}`,
      facts.capacity && `Capacity: ${facts.capacity}`,
      facts.material && `Clay/glaze: ${facts.material}`,
      facts.kind && `Kind: ${facts.kind}`,
      facts.story && `Richard's note about it: ${facts.story}`,
    ].filter(Boolean);

    const promptText = [
      'Draft a listing for the piece in the photos below.',
      '',
      'Facts from Richard:',
      factLines.length ? factLines.join('\n') : '(none given beyond the photos)',
      '',
      `There are ${photos.length} photo(s), in order.`,
      '',
      'For voice reference, here are real existing Lee Pottery listings. Match this register — do not copy their content:',
      JSON.stringify(examples.map(voiceExample), null, 2),
    ].join('\n');

    const anthropic = new Anthropic();
    const message = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: promptText }, ...imageBlocks],
        },
      ],
      output_config: { format: zodOutputFormat(draftSchema(photos.length)) },
    });

    const draft = message.parsed_output;
    if (!draft) {
      return NextResponse.json({ draft: null, error: 'The model returned no structured draft.' }, { status: 200 });
    }
    return NextResponse.json({ draft });
  } catch (error) {
    // Never block the pipeline: the review screen opens with photos attached
    // and fields empty when drafting fails.
    return NextResponse.json(
      { draft: null, error: error instanceof Error ? error.message : 'Drafting failed.' },
      { status: 200 },
    );
  }
}

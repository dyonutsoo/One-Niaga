import { NextRequest, NextResponse } from 'next/server';
import { callAgnes, parsePipedLines } from '@/lib/agnes';
import { PLATFORMS, UI_LANGUAGES } from '@/lib/platforms';
import { WEEKLY_SALES } from '@/lib/seed';
import { priceSpread, topReturnReason } from '@/lib/utils';
import type { Order, Product, UiLang } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: { products?: Product[]; orders?: Order[]; lang?: UiLang };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const products = body.products ?? [];
  const orders = body.orders ?? [];
  const languageLabel = UI_LANGUAGES.find((l) => l.id === body.lang)?.label || 'English';

  const backlog = PLATFORMS.map(
    (p) => `${p.name}: ${orders.filter((o) => o.platform === p.id && o.status !== 'delivered').length}`
  ).join(', ');

  const returnsSummary = products
    .map((p) => {
      const lines = PLATFORMS.map((pl) => {
        const r = p.returns?.[pl.id];
        const top = topReturnReason(r?.reasons);
        return `${pl.name}: ${r?.total || 0} returns${top ? ` (top reason: ${top.key})` : ''}`;
      }).join('; ');
      return `- ${p.name}: ${lines}`;
    })
    .join('\n');

  const priceIssues =
    products
      .filter((p) => priceSpread(p.platformPrices) > 3)
      .map((p) => `- ${p.name}: price varies by RM ${priceSpread(p.platformPrices).toFixed(2)} across platforms`)
      .join('\n') || 'None';

  const prompt = `You are OneNiaga's AI business advisor for a Malaysian multi-platform seller. Based on this simulated data, produce today's prioritised action list.
Write your entire response (titles and reasons) in ${languageLabel}, regardless of the language this data is written in.

Inventory (product, units left, average units sold per day):
${products.map((p) => `- ${p.name}: ${p.stock} units left, selling ~${p.dailySales}/day`).join('\n')}

Orders not yet delivered, by platform: ${backlog}

Last 7 days revenue by platform:
${JSON.stringify(WEEKLY_SALES)}

Returns and return reasons per product, per platform (last 7 days):
${returnsSummary}

Products with inconsistent pricing across platforms:
${priceIssues}

Generate 3-5 prioritised recommendations. Cover restocking, platform focus, AND at least one recommendation about returns or pricing if the data above shows a real issue.

Respond with ONLY plain lines in exactly this format — one recommendation per line, nothing else before or after, no markdown, no numbering, no bullet points:
level|title|reason

Where level is exactly one of: high, medium, low. title is under 8 words (in ${languageLabel}). reason is one sentence grounded in the numbers above (in ${languageLabel}). Do not use any "|" character inside title or reason. Do not wrap anything in quotes.
Example line: high|Restock Product A today|Only 2 days of stock left at the current sales pace.`;

  try {
    const text = await callAgnes(prompt);
    const priorities = parsePipedLines(text);
    return NextResponse.json({ priorities });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

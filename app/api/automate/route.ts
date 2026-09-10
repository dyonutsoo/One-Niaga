import { NextRequest, NextResponse } from 'next/server';
import { callAgnes, parseMarkedSections } from '@/lib/agnes';
import { CONTENT_LANGUAGES } from '@/lib/platforms';

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    category?: string;
    features?: string;
    price?: string;
    contentLang?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, category, features, price, contentLang } = body;
  if (!name?.trim() || !features?.trim()) {
    return NextResponse.json({ error: 'name and features are required' }, { status: 400 });
  }

  const languageLabel = CONTENT_LANGUAGES.find((l) => l.id === contentLang)?.label || 'English';

  const prompt = `You are OneNiaga's AI listing assistant for a Malaysian multi-platform e-commerce seller.
Product name: ${name}
Category: ${category || 'general'}
Key features / materials: ${features}
Price: RM ${price || 'N/A'}
Write the descriptions in ${languageLabel}.

Write three product listing descriptions for the SAME product, matched to platform norms:
- Shopee: concise, bullet-friendly, price/promo-driven, 40-70 words
- Lazada: trust-focused, detailed specs, reassuring tone, 60-90 words
- TikTok Shop: casual, trend-driven, short punchy hooks, light emoji use, 30-50 words

All three must describe the exact same product consistently (same claims, same specs).

Respond in EXACTLY this format, nothing before or after, no markdown, no JSON:

===SHOPEE===
<shopee description here>
===LAZADA===
<lazada description here>
===TIKTOK===
<tiktok description here>`;

  try {
    const text = await callAgnes(prompt);
    const json = parseMarkedSections(text, ['shopee', 'lazada', 'tiktok']);
    return NextResponse.json({ shopee: json.shopee, lazada: json.lazada, tiktok: json.tiktok });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { callAgnes } from '@/lib/agnes';
import { UI_LANGUAGES, WEEKLY_SALES } from '@/lib/seed';
import { PLATFORMS } from '@/lib/platforms';

export async function POST(req: NextRequest) {
  let body: { lang?: string; platforms?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const connected = PLATFORMS.filter(p => Array.isArray(body.platforms) && body.platforms.includes(p.id));
  if (!connected.length) return NextResponse.json({ error: 'Connect a store before requesting sales insights.' }, { status: 400 });
  const sales = WEEKLY_SALES.map(day => Object.fromEntries([['day', day.day], ...connected.map(p => [p.name, day[p.name as keyof typeof day]])]));
  const languageLabel = UI_LANGUAGES.find((l) => l.id === body.lang)?.label || 'English';

  const prompt = `You are OneNiaga's AI analytics assistant. Here is one seller's last 7 days revenue (RM) by platform:
${JSON.stringify(sales)}
Write a short 2-3 sentence business-owner-friendly interpretation, entirely in ${languageLabel}: identify the clearest trend, name which platform is rising/falling, and give one plausible reason. Plain language, no jargon.
Respond with ONLY the 2-3 sentences as plain text — no JSON, no quotation marks around it, no preamble, no markdown.`;

  try {
    const text = await callAgnes(prompt);
    return NextResponse.json({ summary: text.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

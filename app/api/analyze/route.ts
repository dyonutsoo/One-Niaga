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

  const requestedPlatforms = Array.isArray(body.platforms) && body.platforms.length
    ? body.platforms
    : PLATFORMS.map((p) => p.id);
  const connected = PLATFORMS.filter(p => requestedPlatforms.includes(p.id));
  const sales = WEEKLY_SALES.map(day => Object.fromEntries([['day', day.day], ...connected.map(p => [p.name, day[p.name as keyof typeof day]])]));
  const languageLabel = UI_LANGUAGES.find((l) => l.id === body.lang)?.label || 'English';

  const prompt = `You are OneNiaga's AI analytics assistant. Here is one seller's last 7 days revenue (RM) by platform:
${JSON.stringify(sales)}
Write a short 2-3 sentence business-owner-friendly interpretation, entirely in ${languageLabel}: identify the clearest trend, name which platform is rising/falling, and give one plausible reason. Plain language, no jargon.
Respond with ONLY the 2-3 sentences as plain text — no JSON, no quotation marks around it, no preamble, no markdown.`;

  try {
    const text = await callAgnes(prompt, 220);
    return NextResponse.json({ summary: text.trim() });
  } catch (error) {
    return NextResponse.json({ summary: buildLocalSalesSummary(connected, body.lang) });
  }
}

function buildLocalSalesSummary(connected: typeof PLATFORMS, lang?: string) {
  const trends = connected.map((platform) => {
    const first = Number(WEEKLY_SALES[0][platform.name as keyof typeof WEEKLY_SALES[number]]);
    const last = Number(WEEKLY_SALES[WEEKLY_SALES.length - 1][platform.name as keyof typeof WEEKLY_SALES[number]]);
    return { name: platform.name, change: last - first, first, last };
  });
  const strongest = trends.reduce((best, item) => item.change > best.change ? item : best, trends[0]);
  const softest = trends.reduce((worst, item) => item.change < worst.change ? item : worst, trends[0]);
  const total = WEEKLY_SALES.reduce(
    (sum, day) => sum + connected.reduce((inner, platform) => inner + Number(day[platform.name as keyof typeof day]), 0),
    0
  );

  if (lang === 'ms') {
    return `Jumlah jualan 7 hari ialah RM ${total.toLocaleString('en-MY')}, dengan ${strongest.name} menunjukkan momentum paling kuat daripada RM ${strongest.first} kepada RM ${strongest.last}. ${softest.name} semakin perlahan, jadi beri perhatian pada promosi, harga, atau stok untuk saluran itu minggu ini.`;
  }

  if (lang === 'zh') {
    return `过去 7 天总销售额为 RM ${total.toLocaleString('en-MY')}，其中 ${strongest.name} 的增长最明显，从 RM ${strongest.first} 上升到 RM ${strongest.last}。${softest.name} 的表现走弱，本周可以优先检查该渠道的促销、价格或库存情况。`;
  }

  return `The 7-day total is RM ${total.toLocaleString('en-MY')}, with ${strongest.name} showing the clearest momentum from RM ${strongest.first} to RM ${strongest.last}. ${softest.name} is softening, so this week is worth checking that channel's promotion, pricing, or stock position.`;
}

import { NextRequest, NextResponse } from 'next/server';
import { callAgnes } from '@/lib/agnes';
import { platformName } from '@/lib/utils';

export async function POST(req: NextRequest) {
  let body: {
    platform?: string;
    product?: string;
    listingText?: string | null;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { platform, product, listingText, message } = body;
  if (!platform || !product || !message) {
    return NextResponse.json({ error: 'platform, product, and message are required' }, { status: 400 });
  }

  const platformListingName = listingText
    ? `On ${platformName(platform)}, this product's own listing describes it as follows — match its naming/tone when you refer to the product: "${listingText}"`
    : `No platform-specific listing text is available yet — refer to the product simply as "${product}".`;

  const prompt = `You are OneNiaga's AI customer service assistant for a Malaysian multi-platform seller.
Platform: ${platformName(platform)}
Product (internal reference name): ${product}
${platformListingName}
Customer message: "${message}"

Write a short, friendly, on-brand reply (2-3 sentences) a small business owner could send as-is.
IMPORTANT: Detect the language the customer used in their message above, and reply in that SAME language — do not default to English unless the customer wrote in English. Match the customer's tone.
When referring to the product, use the naming style from the platform listing text above (if given) rather than a generic translated name, so it reads naturally to a customer already viewing that listing.
If they ask something you can't know for certain (like exact shipping time), reassure them and say the team will confirm shortly.
Respond with ONLY the reply text itself as plain text — no JSON, no quotation marks around it, no preamble, no labels.`;

  try {
    const text = await callAgnes(prompt);
    return NextResponse.json({ reply: text.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}


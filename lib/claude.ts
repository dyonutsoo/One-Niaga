// lib/claude.ts — now calls Agnes AI's free API instead of Anthropic.
// Every exported name and signature is UNCHANGED from the original file, so
// none of the four app/api/*/route.ts files need any edits at all — they
// keep importing { callClaude }, { callClaude, parseMarkedSections }, or
// { callClaude, parsePipedLines } exactly as before.
//
// SETUP:
// 1. .env.local (and Vercel/Netlify → Project Settings → Environment Variables):
//      AGNES_API_KEY=your-real-agnes-key
//    (ANTHROPIC_API_KEY is no longer read anywhere — safe to remove.)
// 2. Redeploy after adding/changing the env var — it will not take effect
//    on an already-running deployment.

const AGNES_BASE_URL = 'https://apihub.agnes-ai.com/v1/chat/completions';
const AGNES_MODEL = 'agnes-2.5-flash';

export async function callClaude(prompt: string, maxTokens = 1024): Promise<string> {
  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) {
    throw new Error(
      'AGNES_API_KEY is not set. Add it to your environment (.env.local for local dev, or your Vercel/Netlify project env vars) to enable the AI features.'
    );
  }

  let response: Response;
  try {
    response = await fetch(AGNES_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AGNES_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (err) {
    throw new Error(`Failed to reach Agnes AI: ${err instanceof Error ? err.message : String(err)}`);
  }

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid or missing AGNES_API_KEY');
    }
    if (response.status === 429) {
      throw new Error('Rate limited by Agnes AI — please try again shortly');
    }
    const msg = data?.error?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(`Agnes AI error ${response.status}: ${msg}`);
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response from model');
  return text;
}

// --- Unchanged below: pure text parsing, never touched Anthropic directly ---

// Parses output delimited by ===KEY=== markers — avoids JSON entirely so quotes,
// apostrophes, and line breaks inside the model's text can never break parsing.
export function parseMarkedSections(text: string, keys: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of keys) {
    const marker = `===${key.toUpperCase()}===`;
    const startIdx = text.indexOf(marker);
    if (startIdx === -1) continue;
    const afterStart = startIdx + marker.length;
    let endIdx = text.length;
    for (const other of keys) {
      if (other === key) continue;
      const otherMarker = `===${other.toUpperCase()}===`;
      const otherIdx = text.indexOf(otherMarker, afterStart);
      if (otherIdx !== -1 && otherIdx < endIdx) endIdx = otherIdx;
    }
    result[key] = text.slice(afterStart, endIdx).trim();
  }
  const missing = keys.filter((k) => !result[k]);
  if (missing.length) throw new Error(`Missing sections in model response: ${missing.join(', ')}`);
  return result;
}

// Parses pipe-delimited lines "level|title|reason" — robust against quotes/newlines.
export function parsePipedLines(text: string): { level: string; title: string; reason: string }[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const rows: { level: string; title: string; reason: string }[] = [];
  for (const line of lines) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 3) continue;
    const [level, title, ...rest] = parts;
    rows.push({ level: level.toLowerCase(), title, reason: rest.join(' | ') });
  }
  if (rows.length === 0) throw new Error('Could not find any valid recommendation lines in model response');
  return rows;
}

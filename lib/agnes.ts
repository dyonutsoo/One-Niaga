// Server-side Agnes AI client. Import only from API routes.
const AGNES_ENDPOINT = 'https://apihub.agnes-ai.com/v1/chat/completions';
const AGNES_MODEL = 'agnes-2.5-flash';

export async function callAgnes(prompt: string, maxTokens = 1024): Promise<string> {
  const apiKey = process.env.AGNES_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('AGNES_API_KEY is not set. Add your Agnes key to .env.local or your hosting environment, then restart or redeploy.');
  }
  let response: Response;
  try {
    response = await fetch(AGNES_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: AGNES_MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(60000),
      cache: 'no-store',
    });
  } catch {
    throw new Error('Unable to reach Agnes AI or the request timed out. Please try again.');
  }
  // Do not return raw upstream error bodies: they may contain sensitive details.
  if (response.status === 401 || response.status === 403) throw new Error('Agnes AI rejected the API key. Check AGNES_API_KEY and its permissions.');
  if (response.status === 429) throw new Error('Agnes AI usage limit reached. Please try again later.');
  if (!response.ok) throw new Error(`Agnes AI request failed (HTTP ${response.status}). Please try again.`);
  let data: { choices?: { message?: { content?: unknown } }[] };
  try { data = await response.json(); }
  catch { throw new Error('Agnes AI returned an invalid response. Please try again.'); }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('Agnes AI returned an empty or unsupported response. Please try again.');
  return content.trim();
}

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


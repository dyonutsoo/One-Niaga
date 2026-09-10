import { test } from 'node:test';
import assert from 'node:assert/strict';
import { callAgnes, parseMarkedSections, parsePipedLines } from '../lib/agnes.ts';

test('Agnes client uses the configured key, endpoint, model and response format', async t => {
  const previous = process.env.AGNES_API_KEY;
  process.env.AGNES_API_KEY = 'test-only-placeholder';
  t.after(() => { if (previous === undefined) delete process.env.AGNES_API_KEY; else process.env.AGNES_API_KEY = previous; });
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://apihub.agnes-ai.com/v1/chat/completions');
    assert.equal(options.headers.Authorization, 'Bearer test-only-placeholder');
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal);
    assert.deepEqual(JSON.parse(options.body), { model: 'agnes-2.5-flash', max_tokens: 128, messages: [{ role: 'user', content: 'Test prompt' }] });
    return Response.json({ choices: [{ message: { content: '  Result  ' } }] });
  });
  assert.equal(await callAgnes('Test prompt', 128), 'Result');
});

test('missing key fails before any request', async t => {
  const previous = process.env.AGNES_API_KEY;
  delete process.env.AGNES_API_KEY;
  t.after(() => { if (previous !== undefined) process.env.AGNES_API_KEY = previous; });
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('should not run'); });
  await assert.rejects(callAgnes('Test'), /AGNES_API_KEY is not set/);
  assert.equal(mock.mock.callCount(), 0);
});

test('upstream errors and invalid outputs are handled without leaking bodies', async t => {
  const previous = process.env.AGNES_API_KEY;
  process.env.AGNES_API_KEY = 'test-only-placeholder';
  t.after(() => { if (previous === undefined) delete process.env.AGNES_API_KEY; else process.env.AGNES_API_KEY = previous; });
  for (const [status, pattern] of [[401, /rejected the API key/], [403, /rejected the API key/], [429, /usage limit/], [500, /HTTP 500/]]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => new Response('private upstream details', { status }));
    await assert.rejects(callAgnes('Test'), error => pattern.test(error.message) && !error.message.includes('private upstream details'));
    mock.mock.restore();
  }
  for (const response of [new Response('not JSON'), Response.json({ choices: [] }), Response.json({ choices: [{ message: { content: ['unsupported'] } }] })]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => response);
    await assert.rejects(callAgnes('Test'), /invalid response|empty or unsupported/);
    mock.mock.restore();
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('network details'); });
  await assert.rejects(callAgnes('Test'), /Unable to reach Agnes AI/);
});

test('existing listing and recommendation parsers still work', () => {
  assert.deepEqual(parseMarkedSections('===SHOPEE===\nDraft', ['shopee']), { shopee: 'Draft' });
  assert.deepEqual(parsePipedLines('high|Restock|Only two units left'), [{ level: 'high', title: 'Restock', reason: 'Only two units left' }]);
});

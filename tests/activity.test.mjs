import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityKey } from '../lib/activity.ts';
const event = (type, message) => ({ id: 'test', ts: 0, channel: 'shopee', latencyMs: 10, type, message });
test('business labels describe the event without claiming delivery success', () => {
  assert.equal(activityKey(event('INBOUND', 'order.created — SP-1 x1 received')), 'activity.order');
  assert.equal(activityKey(event('OUTBOUND', 'stock.update pushed — SP-1 set to 2')), 'activity.stock');
  assert.equal(activityKey(event('INBOUND', 'webhook.live_drop — hold requested')), 'activity.reserved');
  assert.equal(activityKey(event('OUTBOUND', 'hold.release — 2 units returned')), 'activity.released');
});
test('unrecognized events have neutral fallback labels', () => {
  assert.equal(activityKey(event('CALC', 'New calculation type')), 'activity.calculation');
  assert.equal(activityKey(event('OUTBOUND', 'Delivery attempted')), 'activity.sent');
  assert.equal(activityKey(event('INBOUND', 'New update type')), 'activity.received');
});

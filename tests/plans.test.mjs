import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAN_DEFS, canConnect, canSwitchPlan, currentUsage, creditsRemaining, monthKey } from '../lib/plans.ts';

test('each tier has coherent store and AI capacity', () => {
  assert.deepEqual(PLAN_DEFS.map(p => [p.id, p.storeLimit, p.aiCredits]), [['free', 2, 20], ['growth', 3, 200], ['pro', 4, 1000]]);
  for (const plan of PLAN_DEFS) {
    assert.equal(canConnect(plan.id, plan.storeLimit - 1), true);
    assert.equal(canConnect(plan.id, plan.storeLimit), false);
    assert.equal(canSwitchPlan(plan.id, plan.storeLimit), true);
    assert.equal(canSwitchPlan(plan.id, plan.storeLimit + 1), false);
  }
});
test('upgrades expand credits without erasing usage; downgrades can exhaust them', () => {
  const usage = { month: monthKey(), used: 25 };
  assert.equal(creditsRemaining('free', usage), 0);
  assert.equal(creditsRemaining('growth', usage), 175);
  assert.equal(creditsRemaining('pro', usage), 975);
  assert.equal(usage.used, 25);
});
test('in-flight reservations count against available credits', () => {
  const usage = { month: monthKey(), used: 19 };
  assert.equal(creditsRemaining('free', usage, 0), 1);
  assert.equal(creditsRemaining('free', usage, 1), 0);
  assert.equal(creditsRemaining('free', usage, 2), 0);
});
test('calendar reset handles year boundary without rollover', () => {
  const usage = { month: '2026-12', used: 7 };
  assert.equal(currentUsage(usage, '2026-12'), usage);
  assert.deepEqual(currentUsage(usage, '2027-01'), { month: '2027-01', used: 0 });
  assert.equal(monthKey(new Date(2027, 0, 1)), '2027-01');
});

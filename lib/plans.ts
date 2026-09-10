import type { PlanDef, PlanId } from './types';

// One connection = one store on one of the four supported platforms.
export const PLAN_DEFS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'RM 0',
    storeLimit: 2,
    aiCredits: 20,
    features: ['2 connected shops', 'Orders and product tracking', '20 AI actions / month', 'Basic inventory sync demo'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 'RM 79',
    storeLimit: 3,
    aiCredits: 200,
    features: ['3 connected shops', 'AI listing drafts and rewrites', 'AI sales summaries and priorities', 'Customer reply drafts'],
    highlight: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'RM 179',
    storeLimit: 4,
    aiCredits: 1000,
    features: ['4 connected shops', 'Higher AI allowance', 'Advanced sync controls', 'Priority support'],
  },
];
export const getPlan = (id: PlanId) => PLAN_DEFS.find(p => p.id === id)!;
export const canConnect = (id: PlanId, count: number) => count < (getPlan(id).storeLimit ?? 0);
export const canSwitchPlan = (id: PlanId, count: number) => count <= (getPlan(id).storeLimit ?? 0);
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
export type Usage = { month: string; used: number };
export function currentUsage(usage: Usage, month = monthKey()): Usage {
  return usage.month === month ? usage : { month, used: 0 };
}
export function creditsRemaining(id: PlanId, usage: Usage, pending = 0) {
  return Math.max(0, (getPlan(id).aiCredits ?? 0) - currentUsage(usage).used - pending);
}

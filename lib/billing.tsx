'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { creditsRemaining, currentUsage, monthKey, type Usage } from './plans';
import type { PlanId } from './types';

type Billing = {
  plan: PlanId; used: number; pending: number; remaining: number; resetDate: Date;
  activate: (email: string) => void;
  changePlan: (id: PlanId) => void;
  aiFetch: typeof fetch;
};
const Context = createContext<Billing | null>(null);
export function useBilling() {
  const value = useContext(Context);
  if (!value) throw new Error('BillingProvider is required');
  return value;
}

// Demo entitlements only. Production requires authenticated server-side metering.
export function BillingProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanId>('free');
  const [usage, setUsage] = useState<Usage>({ month: monthKey(), used: 0 });
  const [pending, setPending] = useState(0);
  const state = useRef({ plan: 'free' as PlanId, usage, pending: 0, key: '' });
  function persist() {
    const s = state.current;
    if (!s.key) return;
    try { localStorage.setItem(s.key, JSON.stringify({ plan: s.plan, usage: s.usage })); } catch { /* Storage may be unavailable in private browsing. */ }
  }
  function refresh() {
    state.current.usage = currentUsage(state.current.usage);
    setUsage(state.current.usage);
  }
  useEffect(() => {
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, []);
  function activate(email: string) {
    const key = `oneniaga-billing-v1:${email.trim().toLowerCase()}`;
    let nextPlan: PlanId = 'free';
    let nextUsage: Usage = { month: monthKey(), used: 0 };
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved && ['free', 'growth', 'pro'].includes(saved.plan)) nextPlan = saved.plan;
      if (saved?.usage && typeof saved.usage.month === 'string' && Number.isSafeInteger(saved.usage.used) && saved.usage.used >= 0) nextUsage = currentUsage(saved.usage);
    } catch { /* Start a fresh demo if stored data is invalid. */ }
    state.current = { plan: nextPlan, usage: nextUsage, pending: 0, key };
    setPlan(nextPlan); setUsage(nextUsage); setPending(0);
  }
  function changePlan(id: PlanId) {
    state.current.plan = id;
    setPlan(id);
    refresh(); persist();
  }
  const aiFetch: typeof fetch = async (input, init) => {
    const s = state.current;
    s.usage = currentUsage(s.usage);
    if (creditsRemaining(s.plan, s.usage, s.pending) === 0) throw new Error('AI_LIMIT_REACHED');
    const requestMonth = s.usage.month;
    s.pending += 1; setPending(s.pending);
    try {
      const response = await fetch(input, init);
      if (response.ok) {
        // Validate the response before counting it as a successful generation.
        const data = await response.clone().json();
        const valid = typeof data.summary === 'string' && data.summary.trim() || typeof data.reply === 'string' && data.reply.trim() || Array.isArray(data.priorities) && data.priorities.length > 0 || ['shopee', 'lazada', 'tiktok'].every(k => typeof data[k] === 'string' && data[k].trim());
        if (!valid) throw new Error('AI returned an empty result. Please try again.');
        s.usage = currentUsage(s.usage);
        if (s.usage.month === requestMonth) s.usage = { ...s.usage, used: s.usage.used + 1 };
        if (state.current === s) { setUsage(s.usage); persist(); }
      }
      return response;
    } finally {
      s.pending -= 1;
      if (state.current === s) setPending(s.pending);
    }
  };
  const activeUsage = currentUsage(usage);
  const now = new Date();
  return <Context.Provider value={{ plan, used: activeUsage.used, pending, remaining: creditsRemaining(plan, activeUsage, pending), resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), activate, changePlan, aiFetch }}>{children}</Context.Provider>;
}


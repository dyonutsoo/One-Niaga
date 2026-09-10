'use client';

import { Check, Clock, Sparkles, Store } from 'lucide-react';
import { BORDER, CORAL, CREAM, GREEN, MUTED, NAVY, NAVY_LIGHT } from '@/lib/theme';
import { getPlan, PLAN_DEFS } from '@/lib/plans';
import { useBilling } from '@/lib/billing';
import { useLang } from '@/lib/i18n';
import { PageHeader } from '../ui';
import type { PlanId } from '@/lib/types';

export function SubscriptionPage({
  plan,
  setPlan,
}: {
  plan: PlanId;
  setPlan: (p: PlanId) => void;
}) {
  const { t, lang } = useLang();
  const { used, pending, remaining, resetDate } = useBilling();
  const activePlan = getPlan(plan);
  const totalCredits = activePlan.aiCredits ?? 0;
  const usedCredits = Math.max(0, totalCredits - remaining);
  const usedPercent = totalCredits > 0 ? Math.max(0, Math.min(100, (usedCredits / totalCredits) * 100)) : 0;
  const resetLabel = resetDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short' });
  function subscribe(id: PlanId) {
    setPlan(id);
  }
  return (
    <div>
      <PageHeader eyebrow={t('nav.subscription')} title={t('subscription.titleManage')} desc="Choose the number of shops and AI actions that match your selling workflow. Free includes enough AI to try the core value before upgrading." />
      <div className="px-4 sm:px-8 pb-8 space-y-5">
        <section className="surface p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: CORAL }}>
                <Sparkles className="h-4 w-4" />
                Usage
              </div>
              <h2 className="mt-1 text-xl font-semibold" style={{ color: NAVY }}>AI credits this month</h2>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                Successful AI listing drafts, sales analysis, recommendations, and reply drafts each use 1 credit.
              </p>
            </div>
            <div className="rounded-xl px-5 py-4 text-right" style={{ background: CREAM }}>
              <div className="text-3xl font-bold tabular" style={{ color: remaining === 0 ? CORAL : NAVY }}>{remaining}</div>
              <div className="text-xs font-medium" style={{ color: MUTED }}>credits remaining</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: MUTED }}><Sparkles className="h-4 w-4" /> Credits used</div>
              <div className="mt-2 text-lg font-bold tabular" style={{ color: NAVY }}>{used} / {totalCredits}</div>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>{pending > 0 ? `${pending} pending request${pending === 1 ? '' : 's'}` : 'No AI request in progress'}</p>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: MUTED }}><Store className="h-4 w-4" /> Current plan</div>
              <div className="mt-2 text-lg font-bold" style={{ color: NAVY }}>{activePlan.name}</div>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>{activePlan.storeLimit} connected shops · {totalCredits} AI actions/month</p>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: MUTED }}><Clock className="h-4 w-4" /> Monthly reset</div>
              <div className="mt-2 text-lg font-bold" style={{ color: NAVY }}>{resetLabel}</div>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>Credits reset without rollover.</p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ background: '#EDF0F5' }}>
            <div className="h-full rounded-full" style={{ width: `${usedPercent}%`, background: remaining === 0 ? CORAL : NAVY }} />
          </div>
          {remaining === 0 && (
            <p className="mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: '#FDEBE7', color: CORAL }}>
              AI credits are fully used. Upgrade to Growth or Pro to continue using AI listing generation, analysis, recommendations, and reply drafting.
            </p>
          )}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {PLAN_DEFS.map((pl) => {
          const active = plan === pl.id;
          return (
            <div key={pl.id} className="rounded-xl p-5 flex flex-col" style={{ background: active ? NAVY : 'white', border: pl.highlight && !active ? '1.5px solid #506CC7' : `1px solid ${BORDER}` }}>
              {pl.highlight && !active && <span className="text-[10px] font-bold self-start px-2 py-0.5 rounded-full mb-2" style={{ background: '#EEF2FB', color: '#506CC7' }}>{t('subscription.popular')}</span>}
              <div className="font-bold text-sm" style={{ color: active ? 'white' : NAVY }}>{pl.name}</div>
              <div className="mt-1">
                <span className="text-xl font-bold" style={{ color: active ? 'white' : NAVY }}>{pl.price}</span>
                <span className="text-[11px]" style={{ color: active ? '#9AA6C0' : MUTED }}>/mo</span>
              </div>
              <ul className="mt-3 space-y-1.5 flex-1">
                {pl.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11.5px]" style={{ color: active ? '#E4E8F2' : '#1F2328' }}>
                    <Check size={12} className="mt-0.5 shrink-0" style={{ color: active ? '#8FD9B6' : GREEN }} /> {f}
                  </li>
                ))}
              </ul>
              {active ? (
                <button className="mt-4 w-full py-2 rounded-lg text-[12.5px] font-semibold" style={{ background: NAVY_LIGHT, color: active ? NAVY : MUTED }}>{pl.id === 'free' ? 'Current free plan' : 'Current plan'}</button>
              ) : (
                <button onClick={() => subscribe(pl.id)} className="mt-4 w-full py-2 rounded-lg text-[12.5px] font-semibold text-white" style={{ background: NAVY }}>{plan === 'free' ? t('subscription.subscribe') : t('subscription.switch')}</button>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

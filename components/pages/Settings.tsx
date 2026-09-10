'use client';

import { useState } from 'react';
import { CreditCard, LogOut, Sparkles } from 'lucide-react';
import { BORDER, CORAL, CREAM, GREEN, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { getPlan } from '@/lib/plans';
import { useBilling } from '@/lib/billing';
import { useLang } from '@/lib/i18n';
import { PageHeader } from '../ui';
import type { PlanId, PlatformId, TabId } from '@/lib/types';

export function SettingsPage({
  user,
  linked,
  setLinked,
  subscribed,
  plan,
  setTab,
  onSignOut,
}: {
  user: { email: string } | null;
  linked: Record<PlatformId, boolean>;
  setLinked: (updater: (prev: Record<PlatformId, boolean>) => Record<PlatformId, boolean>) => void;
  subscribed: boolean;
  plan: PlanId;
  setTab: (id: TabId) => void;
  onSignOut: () => void;
}) {
  const { t, lang } = useLang();
  const { used, pending, remaining, resetDate } = useBilling();
  const [connecting, setConnecting] = useState<PlatformId | null>(null);
  const activePlan = getPlan(plan);
  const totalCredits = activePlan.aiCredits ?? 0;
  const usedPercent = totalCredits > 0 ? Math.max(0, Math.min(100, ((totalCredits - remaining) / totalCredits) * 100)) : 0;
  const resetLabel = resetDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short' });
  function toggle(id: PlatformId) {
    if (linked[id]) {
      setLinked((prev) => ({ ...prev, [id]: false }));
      return;
    }
    setConnecting(id);
    setTimeout(() => {
      setLinked((prev) => ({ ...prev, [id]: true }));
      setConnecting(null);
    }, 800);
  }
  return (
    <div>
      <PageHeader eyebrow={t('nav.settings')} title={t('settings.title')} />
      <div className="px-4 sm:px-8 pb-8 space-y-5 max-w-xl">
        <div className="rounded-xl p-5" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="text-[12px] font-semibold mb-1" style={{ color: MUTED }}>{t('settings.signedInAs')}</div>
          <div className="text-sm font-medium" style={{ color: NAVY }}>{user?.email}</div>
          <button onClick={onSignOut} className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#EEF2FB', color: '#506CC7' }}>
            <LogOut size={13} /> {t('settings.signOut')}
          </button>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="text-[12px] font-semibold mb-3" style={{ color: MUTED }}>{t('settings.linked')}</div>
          <div className="space-y-2">
            {PLATFORMS.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg px-3.5 py-2.5" style={{ border: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-sm" style={{ color: '#1F2328' }}>{p.name}</span>
                </div>
                <button onClick={() => toggle(p.id)} disabled={connecting === p.id} className="text-[11.5px] font-semibold px-3 py-1 rounded-lg" style={{ background: linked[p.id] ? '#E3EFE9' : NAVY, color: linked[p.id] ? GREEN : 'white' }}>
                  {connecting === p.id ? t('connect.connecting') : linked[p.id] ? t('settings.disconnect') : t('connect.connect')}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="text-[12px] font-semibold mb-1" style={{ color: MUTED }}>{t('settings.subscription')}</div>
          <div className="text-sm font-medium" style={{ color: NAVY }}>{activePlan.name ?? t('settings.notSubscribed')}</div>
          <button onClick={() => setTab('subscription')} className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: NAVY }}>
            <CreditCard size={13} /> {t('settings.manage')}
          </button>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold mb-1" style={{ color: MUTED }}>
                <Sparkles size={13} /> AI credit usage
              </div>
              <div className="text-2xl font-bold tabular" style={{ color: NAVY }}>{remaining} / {totalCredits}</div>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>
                {used} used{pending > 0 ? `, ${pending} pending` : ''} this month. Resets {resetLabel}.
              </p>
            </div>
            <button onClick={() => setTab('subscription')} className="rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ background: remaining === 0 ? CORAL : NAVY }}>
              {remaining === 0 ? 'Upgrade to continue' : 'Plans & usage'}
            </button>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: CREAM }}>
            <div className="h-full rounded-full" style={{ width: `${usedPercent}%`, background: remaining === 0 ? CORAL : NAVY }} />
          </div>
          {remaining === 0 && (
            <p className="mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: '#FDEBE7', color: CORAL }}>
              AI credits are fully used. Upgrade your plan before generating listings, analysis, recommendations, or reply drafts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

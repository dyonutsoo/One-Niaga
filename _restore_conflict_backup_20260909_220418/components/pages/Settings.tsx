'use client';

import { useState } from 'react';
import { CreditCard, LogOut } from 'lucide-react';
import { BORDER, GREEN, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { useBilling } from '@/lib/billing';
import { getPlan, canConnect } from '@/lib/plans';
import { useLang } from '@/lib/i18n';
import { PageHeader } from '../ui';
import type { PlatformId, TabId } from '@/lib/types';

export function SettingsPage({
  user,
  linked,
  setLinked,


  setTab,
  onSignOut,
}: {
  user: { email: string } | null;
  linked: Record<PlatformId, boolean>;
  setLinked: (updater: (prev: Record<PlatformId, boolean>) => Record<PlatformId, boolean>) => void;


  setTab: (id: TabId) => void;
  onSignOut: () => void;
}) {
  const { t } = useLang();
  const { plan } = useBilling();
  const count = Object.values(linked).filter(Boolean).length;
  const limit = getPlan(plan).storeLimit;
  const [connecting, setConnecting] = useState<PlatformId | null>(null);
  function toggle(id: PlatformId) {
    if (linked[id]) {
      setLinked((prev) => ({ ...prev, [id]: false }));
      return;
    }
    if (connecting || !canConnect(plan, count)) return;
    setConnecting(id);
    setTimeout(() => {
      setLinked((prev) => canConnect(plan, Object.values(prev).filter(Boolean).length) ? { ...prev, [id]: true } : prev);
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
          <button onClick={onSignOut} className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#FBE4DB', color: '#E8552F' }}>
            <LogOut size={13} /> {t('settings.signOut')}
          </button>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="text-[12px] font-semibold mb-3" style={{ color: MUTED }}>{t('settings.linked')} · {count} / {limit}</div>
          <p className="text-xs text-slate-500 mb-3">{t('billing.storeRule')}</p>{count >= limit && <button className="text-sm text-orange-700 mb-3" onClick={() => setTab('subscription')}>{t('billing.moreStores')}</button>}<div className="space-y-2">
            {PLATFORMS.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg px-3.5 py-2.5" style={{ border: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-sm" style={{ color: '#1F2328' }}>{p.name}</span>
                </div>
                <button onClick={() => toggle(p.id)} disabled={connecting !== null || (!linked[p.id] && count >= limit)} className="text-[11.5px] font-semibold px-3 py-1 rounded-lg" style={{ background: linked[p.id] ? '#E3EFE9' : NAVY, color: linked[p.id] ? GREEN : 'white' }}>
                  {connecting === p.id ? t('connect.connecting') : linked[p.id] ? t('settings.disconnect') : count >= limit ? t('billing.storeLimit') : t('connect.connect')}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="text-[12px] font-semibold mb-1" style={{ color: MUTED }}>{t('settings.subscription')}</div>
          <div className="text-sm font-medium" style={{ color: NAVY }}>{getPlan(plan).name}</div>
          <button onClick={() => setTab('subscription')} className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: NAVY }}>
            <CreditCard size={13} /> {t('settings.manage')}
          </button>
        </div>
      </div>
    </div>
  );
}


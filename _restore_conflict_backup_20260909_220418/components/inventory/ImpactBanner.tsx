'use client';

import { Clock, DollarSign, ShieldCheck, Wifi, Zap } from 'lucide-react';
import { NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { useLang } from '@/lib/i18n';
import { rm } from '@/lib/utils';

export function ImpactBanner({
  reconcileHours,
  overselPrevented,
  capitalProtected,
}: {
  reconcileHours: number;
  overselPrevented: number;
  capitalProtected: number;
}) {
  const { t } = useLang();
  return (
    <div className="mx-4 sm:mx-8 mt-6 rounded-2xl overflow-hidden" style={{ background: NAVY }}>
      <div className="px-5 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: '#E8552F' }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white">Operational Impact</div>
            <div className="-mt-0.5 text-[10.5px] font-medium" style={{ color: '#9AA6C0' }}>vs. Manual Excel Workflows</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Clock className="h-4 w-4 shrink-0" style={{ color: '#8FA8E8' }} />
            <div>
              <div className="text-sm font-bold leading-none text-white tabular">{reconcileHours.toFixed(1)} hrs/wk</div>
              <div className="text-[10px]" style={{ color: '#9AA6C0' }}>{t('impact.reconcile')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: '#8FD9B6' }} />
            <div>
              <div className="text-sm font-bold leading-none text-white tabular">{overselPrevented} Orders</div>
              <div className="text-[10px]" style={{ color: '#9AA6C0' }}>{t('impact.oversell')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <DollarSign className="h-4 w-4 shrink-0" style={{ color: '#F3C97A' }} />
            <div>
              <div className="text-sm font-bold leading-none text-white tabular">{rm(capitalProtected)}</div>
              <div className="text-[10px]" style={{ color: '#9AA6C0' }}>{t('impact.capital')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Wifi className="h-4 w-4 shrink-0" style={{ color: '#8FD9B6' }} />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                {PLATFORMS.filter((c) => c.id !== 'webstore').map((c) => (
                  <span key={c.id} className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: c.color }} />
                ))}
                <span className="ml-1 text-sm font-bold leading-none text-white">All Active</span>
              </div>
              <div className="truncate text-[10px]" style={{ color: '#9AA6C0' }}>{t('impact.connections')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

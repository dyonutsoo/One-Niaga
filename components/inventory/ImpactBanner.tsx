'use client';

import { Clock, DollarSign, ShieldCheck, Wifi, Zap } from 'lucide-react';
import { BORDER, MUTED } from '@/lib/theme';
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
    <div className="surface mx-4 sm:mx-8 mt-6 rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: '#EEF2FB', border: `1px solid ${BORDER}` }}>
            <Zap className="h-5 w-5" style={{ color: '#506CC7' }} />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-slate-900">Operational Impact</div>
            <div className="-mt-0.5 text-[10.5px] font-medium" style={{ color: MUTED }}>vs. Manual Excel Workflows</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <Clock className="h-4 w-4 shrink-0" style={{ color: '#506CC7' }} />
            <div>
              <div className="text-sm font-bold leading-none text-slate-900 tabular">{reconcileHours.toFixed(1)} hrs/wk</div>
              <div className="text-[10px]" style={{ color: MUTED }}>{t('impact.reconcile')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: '#49A56C' }} />
            <div>
              <div className="text-sm font-bold leading-none text-slate-900 tabular">{overselPrevented} Orders</div>
              <div className="text-[10px]" style={{ color: MUTED }}>{t('impact.oversell')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <DollarSign className="h-4 w-4 shrink-0" style={{ color: '#D98D12' }} />
            <div>
              <div className="text-sm font-bold leading-none text-slate-900 tabular">{rm(capitalProtected)}</div>
              <div className="text-[10px]" style={{ color: MUTED }}>{t('impact.capital')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <Wifi className="h-4 w-4 shrink-0" style={{ color: '#49A56C' }} />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                {PLATFORMS.filter((c) => c.id !== 'webstore').map((c) => (
                  <span key={c.id} className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: c.color }} />
                ))}
                <span className="ml-1 text-sm font-bold leading-none text-slate-900">All Active</span>
              </div>
              <div className="truncate text-[10px]" style={{ color: MUTED }}>{t('impact.connections')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

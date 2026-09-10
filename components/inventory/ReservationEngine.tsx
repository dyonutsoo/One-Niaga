'use client';

import { AlertTriangle, Lock, Radio, ShieldCheck, Timer, Unlock } from 'lucide-react';
import { BORDER, CORAL, MUTED, NAVY } from '@/lib/theme';
import { useLang } from '@/lib/i18n';
import { ChannelBadge, StatTile, StatusPill } from '../ui';
import { formatCountdown } from '@/lib/utils';
import type { Hold, HoldStatus } from '@/lib/types';

function HoldStatusPill({ status }: { status: HoldStatus }) {
  switch (status) {
    case 'Active':
      return (
        <StatusPill tone="emerald">
          <Lock className="h-3 w-3" /> Active
        </StatusPill>
      );
    case 'Expiring':
      return (
        <StatusPill tone="amber">
          <Timer className="h-3 w-3" /> Expiring
        </StatusPill>
      );
    case 'Expired':
      return (
        <StatusPill tone="rose">
          <AlertTriangle className="h-3 w-3" /> Expired · Unpaid
        </StatusPill>
      );
    case 'Released':
      return (
        <StatusPill tone="slate">
          <Unlock className="h-3 w-3" /> Released
        </StatusPill>
      );
  }
}

export function ReservationEngine({
  holds,
  now,
  onSimulateLiveDrop,
  onForceRelease,
}: {
  holds: Hold[];
  now: number;
  onSimulateLiveDrop: () => void;
  onForceRelease: () => void;
}) {
  const { t } = useLang();
  const activeCount = holds.filter((h) => h.status === 'Active' || h.status === 'Expiring').length;
  const expiredCount = holds.filter((h) => h.status === 'Expired').length;
  const totalLockedUnits = holds.filter((h) => h.status === 'Active' || h.status === 'Expiring').reduce((sum, h) => sum + h.units, 0);

  return (
    <div className="px-4 sm:px-8 py-6">
      <div className="mb-5">
        <div className="text-xs font-bold tracking-wide" style={{ color: CORAL }}>{t('nav.reservations').toUpperCase()}</div>
        <h1 className="flex items-center gap-2 text-2xl font-bold mt-1" style={{ color: NAVY }}>
          <Lock className="h-5 w-5" style={{ color: CORAL }} />
          {t('reservations.title')}
        </h1>
        <p className="text-sm mt-1.5 max-w-2xl" style={{ color: MUTED }}>{t('reservations.desc')}</p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile icon={Lock} label="Units Currently Locked" value={`${totalLockedUnits} units`} sub={`${activeCount} active holds`} accent="navy" />
        <StatTile icon={AlertTriangle} label="Expired, Unreleased" value={`${expiredCount} holds`} sub="Unpaid checkout locks past TTL" accent="amber" />
        <StatTile icon={ShieldCheck} label="Concurrency Protection" value="100%" sub="Zero double-sold units to date" accent="green" />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onSimulateLiveDrop}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
          style={{ border: '1px solid #5B4B8A55', background: '#5B4B8A14', color: '#5B4B8A' }}
        >
          <Radio className="h-4 w-4" />
          Simulate TikTok Live Drop — Lock 15 Units
        </button>
        <button
          onClick={onForceRelease}
          disabled={expiredCount === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
          style={{ border: '1px solid #2E7D5B55', background: '#2E7D5B14', color: '#2E7D5B', opacity: expiredCount === 0 ? 0.4 : 1, cursor: expiredCount === 0 ? 'not-allowed' : 'pointer' }}
        >
          <Unlock className="h-4 w-4" />
          Force Release Unpaid Locks {expiredCount > 0 ? `(${expiredCount})` : ''}
        </button>
      </div>

      <div className="thin-scroll overflow-x-auto rounded-2xl" style={{ border: `1px solid ${BORDER}` }}>
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide" style={{ background: '#F4F1EC', color: MUTED, borderBottom: `1px solid ${BORDER}` }}>
              <th className="px-4 py-3">Hold ID</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Countdown</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...holds].reverse().map((h, idx) => {
              const msRemaining = h.expiresAt - now;
              const isLive = h.status === 'Active' || h.status === 'Expiring';
              return (
                <tr key={h.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 1 ? '#FAF8F4' : 'transparent' }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: MUTED }}>{h.id}</td>
                  <td className="px-4 py-3">
                    <ChannelBadge ch={h.channel} size="xs" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold" style={{ color: NAVY }}>{h.itemName}</div>
                    <div className="font-mono text-[11px]" style={{ color: '#9A927E' }}>{h.sku}</div>
                  </td>
                  <td className="px-4 py-3 font-bold tabular" style={{ color: '#1F2328' }}>{h.units}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{h.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-sm font-semibold tabular"
                      style={{ color: !isLive ? '#B0AA9C' : msRemaining < 60000 ? CORAL : msRemaining < 5 * 60000 ? '#B8791A' : '#1F2328' }}
                    >
                      {isLive ? formatCountdown(msRemaining) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <HoldStatusPill status={h.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

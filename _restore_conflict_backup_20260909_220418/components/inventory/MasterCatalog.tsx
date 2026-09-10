'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, BadgeCheck, ChevronDown, Database, Filter, Gauge, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { BORDER, CORAL, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { useLang } from '@/lib/i18n';
import { StatusPill } from '../ui';
import { timeAgo } from '@/lib/utils';
import type { ChannelMapping, PlatformId, Product } from '@/lib/types';

function SyncStatusBadge({ mapping }: { mapping: ChannelMapping }) {
  return mapping.synced ? (
    <StatusPill tone="emerald">
      <BadgeCheck className="h-3 w-3" /> Synced
    </StatusPill>
  ) : (
    <StatusPill tone="amber">
      <AlertTriangle className="h-3 w-3" /> Drift
    </StatusPill>
  );
}

export function MasterCatalog({
  products,
  onResyncAll,
  resyncing,
  now,
}: {
  products: Product[];
  onResyncAll: () => void;
  resyncing: boolean;
  now: number;
}) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<PlatformId | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        Object.values(item.channels).some((m) => m.externalId.toLowerCase().includes(q));
      const matchesChannel = channelFilter === 'all' || item.channels[channelFilter].stock > 0;
      return matchesQuery && matchesChannel;
    });
  }, [products, query, channelFilter]);

  return (
    <div className="px-4 sm:px-8 py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-bold tracking-wide" style={{ color: CORAL }}>{t('nav.masterCatalog').toUpperCase()}</div>
          <h1 className="flex items-center gap-2 text-2xl font-bold mt-1" style={{ color: NAVY }}>
            <Database className="h-5 w-5" style={{ color: CORAL }} />
            {t('masterCatalog.title')}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: MUTED }}>{t('masterCatalog.desc')}</p>
        </div>
        <button
          onClick={onResyncAll}
          disabled={resyncing}
          className="flex items-center justify-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-bold text-white sm:self-auto"
          style={{ background: NAVY, opacity: resyncing ? 0.7 : 1, cursor: resyncing ? 'wait' : 'pointer' }}
        >
          <RefreshCw className={`h-4 w-4 ${resyncing ? 'animate-spin' : ''}`} />
          {resyncing ? 'Re-syncing all channels…' : 'Re-sync All Channels'}
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#9A927E' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, master SKU, category, or channel ID…"
            className="w-full rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none"
            style={{ border: `1px solid ${BORDER}`, background: 'white', color: '#1F2328' }}
          />
        </div>
        <div className="relative">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as PlatformId | 'all')}
            className="w-full appearance-none rounded-xl py-2.5 pl-9 pr-9 text-sm font-medium outline-none sm:w-52"
            style={{ border: `1px solid ${BORDER}`, background: 'white', color: '#1F2328' }}
          >
            <option value="all">All channels</option>
            {PLATFORMS.map((c) => (
              <option key={c.id} value={c.id}>{c.name} only</option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#9A927E' }} />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#9A927E' }} />
        </div>
      </div>

      <div className="thin-scroll overflow-x-auto rounded-2xl" style={{ border: `1px solid ${BORDER}` }}>
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide" style={{ background: '#F4F1EC', color: MUTED, borderBottom: `1px solid ${BORDER}` }}>
              <th className="px-4 py-3">Master SKU</th>
              <th className="px-4 py-3">Master Stock</th>
              {PLATFORMS.map((c) => (
                <th key={c.id} className="px-4 py-3">{c.name}</th>
              ))}
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Velocity</th>
            </tr>
          </thead>
          <tbody className={resyncing ? 'shimmer' : ''}>
            {filtered.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 1 ? '#FAF8F4' : 'transparent' }}>
                <td className="px-4 py-3">
                  <div className="font-semibold" style={{ color: NAVY }}>{item.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px]" style={{ color: '#9A927E' }}>
                    <span className="font-mono">{item.sku}</span>
                    <span>·</span>
                    <span>{item.category}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold tabular" style={{ color: NAVY }}>{item.masterStock}</span>
                  <span className="ml-1 text-xs" style={{ color: MUTED }}>units</span>
                </td>
                {PLATFORMS.map((c) => {
                  const mapping = item.channels[c.id];
                  return (
                    <td key={c.id} className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px]" style={{ color: '#9A927E' }}>{mapping.externalId}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold tabular" style={{ color: mapping.stock === 0 ? CORAL : '#1F2328' }}>{mapping.stock}</span>
                          <SyncStatusBadge mapping={mapping} />
                        </div>
                        <span className="text-[10px]" style={{ color: '#B0AA9C' }}>{timeAgo(mapping.lastSyncedAt, now)}</span>
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  <span className="font-semibold tabular" style={{ color: '#B8791A' }}>{item.reserved}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {item.dailySales > 8 ? (
                      <TrendingUp className="h-3.5 w-3.5" style={{ color: '#2E7D5B' }} />
                    ) : item.dailySales < 1 ? (
                      <TrendingDown className="h-3.5 w-3.5" style={{ color: CORAL }} />
                    ) : (
                      <Gauge className="h-3.5 w-3.5" style={{ color: MUTED }} />
                    )}
                    <span className="font-semibold tabular" style={{ color: '#1F2328' }}>{item.dailySales}</span>
                    <span className="text-xs" style={{ color: MUTED }}>/day</span>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: MUTED }}>No SKUs match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

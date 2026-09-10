'use client';

import { useRef, useState } from 'react';
import { AlertTriangle, ArrowRightLeft, Flame, Sparkles, TrendingDown } from 'lucide-react';
import { CORAL, MUTED, NAVY } from '@/lib/theme';
import { useLang } from '@/lib/i18n';
import { RecommendationCard } from '../ui';
import { formatCountdown, rm } from '@/lib/utils';
import type { Product } from '@/lib/types';

type RecKey = 'stockout' | 'mismatch' | 'deadstock';

export function ActionConsole({
  products,
  onDraftPO,
  onReallocate,
  onLiquidate,
  poCount,
  now,
}: {
  products: Product[];
  onDraftPO: () => void;
  onReallocate: () => void;
  onLiquidate: () => void;
  poCount: number;
  now: number;
}) {
  const { t } = useLang();
  const [doneMap, setDoneMap] = useState<Record<RecKey, boolean>>({ stockout: false, mismatch: false, deadstock: false });

  const hoodie = products.find((p) => p.sku === 'OH-001')!;
  const lipTint = products.find((p) => p.sku === 'RLT-004')!;
  const tote = products.find((p) => p.sku === 'CTB-001')!;

  const stockoutDeadlineRef = useRef(now + 32 * 60 * 60 * 1000);
  const msToStockout = Math.max(0, stockoutDeadlineRef.current - now);
  const hoursToStockout = msToStockout / (1000 * 60 * 60);

  function fire(key: RecKey, action: () => void) {
    if (doneMap[key]) return;
    action();
    setDoneMap((prev) => ({ ...prev, [key]: true }));
  }

  return (
    <div className="px-4 sm:px-8 py-6">
      <div className="mb-5">
        <div className="text-xs font-bold tracking-wide" style={{ color: CORAL }}>{t('nav.actionConsole').toUpperCase()}</div>
        <h1 className="flex items-center gap-2 text-2xl font-bold mt-1" style={{ color: NAVY }}>
          <Sparkles className="h-5 w-5" style={{ color: CORAL }} />
          {t('actionConsole.title')}
        </h1>
        <p className="text-sm mt-1.5 max-w-2xl" style={{ color: MUTED }}>{t('actionConsole.desc')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecommendationCard
          accent="coral"
          icon={AlertTriangle}
          badge="Critical · Stockout Imminent"
          title={hoodie.name}
          subtitle="Run-rate has outpaced replenishment lead time. Without action, this SKU sells out mid-weekend across all channels simultaneously."
          metrics={[
            { label: 'Run-rate', value: `${hoodie.dailySales} units/day` },
            { label: 'Warehouse', value: `${hoodie.masterStock} units` },
            { label: 'Lead time', value: '4 days' },
            { label: 'Stockout in', value: formatCountdown(msToStockout) },
          ]}
          riskLabel="Revenue at risk this weekend"
          riskValue={rm(1440)}
          actionLabel="1-Click Draft Supplier PO (150 Units)"
          doneLabel={`PO Drafted — ${poCount > 0 ? 'sent to supplier queue' : 'queued'}`}
          done={doneMap.stockout}
          onAction={() => fire('stockout', onDraftPO)}
        >
          {hoursToStockout < 6 && !doneMap.stockout && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: CORAL }}>
              <Flame className="h-3.5 w-3.5" />
              Trigger threshold breached — action recommended now
            </div>
          )}
        </RecommendationCard>

        <RecommendationCard
          accent="amber"
          icon={ArrowRightLeft}
          badge="Cross-Channel Mismatch"
          title={lipTint.name}
          subtitle="TikTok has high buyer intent and zero sellable stock, while identical inventory sits idle on Lazada. Demand is being lost to a channel that already sold out."
          metrics={[
            { label: 'TikTok stock', value: `${lipTint.channels.tiktok.stock} units` },
            { label: 'Lazada stock', value: `${lipTint.channels.lazada.stock} units` },
            { label: 'TikTok velocity', value: 'High' },
            { label: 'Lazada (7d sales)', value: `${lipTint.salesByPlatform.lazada?.units ?? 0} units` },
          ]}
          riskLabel="Unmet demand"
          riskValue={`${rm(490)}/day`}
          actionLabel="Reallocate 25 Units: Lazada → TikTok"
          doneLabel="Reallocated — webhook pushed to TikTok"
          done={doneMap.mismatch}
          onAction={() => fire('mismatch', onReallocate)}
        />

        <RecommendationCard
          accent="navy"
          icon={TrendingDown}
          badge="Deadstock Liquidation"
          title={tote.name}
          subtitle="68 units have moved 0.4/day for 42 consecutive days. Capital is parked in inventory that isn't converting — a targeted bundle discount on your highest-traffic channel unlocks it."
          metrics={[
            { label: 'Stagnant units', value: `${tote.masterStock} units` },
            { label: 'Days idle', value: '42 days' },
            { label: 'Idle capital', value: rm(3060) },
            { label: 'Target channel', value: 'Shopee' },
          ]}
          riskLabel="Working capital tied up"
          riskValue={rm(3060)}
          actionLabel="Push 15% Hero Bundle to Shopee"
          doneLabel="Campaign live on Shopee"
          done={doneMap.deadstock}
          onAction={() => fire('deadstock', onLiquidate)}
        />
      </div>
    </div>
  );
}

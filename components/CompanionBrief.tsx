'use client';

import { ArrowRight, CheckCircle2, ClipboardCheck, Sparkles, TriangleAlert, Zap } from 'lucide-react';
import { AMBER, BORDER, CORAL, CREAM, GREEN, MUTED, NAVY } from '@/lib/theme';
import type { CompanionRecommendation } from '@/lib/types';

const SEVERITY_STYLE: Record<CompanionRecommendation['severity'], { bg: string; fg: string; label: string }> = {
  critical: { bg: '#FDEBE7', fg: CORAL, label: 'Critical' },
  high: { bg: '#EEF2FB', fg: '#506CC7', label: 'High' },
  medium: { bg: '#FFF4DE', fg: AMBER, label: 'Medium' },
  low: { bg: '#E3EFE9', fg: GREEN, label: 'Low' },
};

function RecommendationRow({
  item,
  done,
  compact,
  onApprove,
  onOpen,
}: {
  item: CompanionRecommendation;
  done?: boolean;
  compact?: boolean;
  onApprove?: (item: CompanionRecommendation) => void;
  onOpen?: (item: CompanionRecommendation) => void;
}) {
  const style = SEVERITY_STYLE[item.severity];
  return (
    <div
      className="rounded-lg border bg-white p-4"
      style={{ borderColor: done ? '#CBE9D8' : BORDER, opacity: done ? 0.78 : 1 }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: style.bg, color: style.fg }}>
              {style.label}
            </span>
            <span className="truncate text-[11px] font-medium" style={{ color: MUTED }}>{item.affected}</span>
          </div>
          <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold leading-snug`} style={{ color: NAVY }}>{item.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: MUTED }}>{item.reason}</p>
          {!compact && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: CREAM, color: MUTED }}>
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>Estimated business impact</span>
              <strong className="font-bold tabular" style={{ color: CORAL }}>{item.impact}</strong>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
          {onOpen && (
            <button onClick={() => onOpen(item)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: BORDER, color: NAVY }}>
              Open <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {onApprove && (
            <button
              onClick={() => onApprove(item)}
              disabled={done}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white"
              style={{ background: done ? GREEN : NAVY, cursor: done ? 'default' : 'pointer' }}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
              {done ? 'Approved' : item.actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MorningPriorityBrief({
  recommendations,
  completedIds,
  onApprove,
  onOpen,
}: {
  recommendations: CompanionRecommendation[];
  completedIds: Set<string>;
  onApprove: (item: CompanionRecommendation) => void;
  onOpen: (item: CompanionRecommendation) => void;
}) {
  const top = recommendations.slice(0, 5);
  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#f3f5f8] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: CORAL }}>
            <Sparkles className="h-4 w-4" />
            AI Companion
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight" style={{ color: NAVY }}>Morning Priority Brief</h2>
          <p className="mt-1 max-w-2xl text-sm" style={{ color: MUTED }}>
            OneNiaga watches stock, orders, listings, returns, and customer messages, then prepares the next best action for seller approval.
          </p>
        </div>
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: CREAM, color: MUTED }}>
          <strong className="font-bold tabular" style={{ color: NAVY }}>{top.length}</strong> actions ready today
        </div>
      </div>
      <div className="space-y-3 p-4 sm:p-6">
        {top.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm" style={{ borderColor: BORDER, color: MUTED }}>
            No urgent action right now. The companion will surface risks as orders, stock, and messages change.
          </div>
        ) : (
          top.map((item) => (
            <RecommendationRow
              key={item.id}
              item={item}
              done={completedIds.has(item.id)}
              onApprove={onApprove}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function CompanionPanel({
  title,
  subtitle,
  recommendations,
  completedIds,
  onApprove,
  onOpen,
}: {
  title: string;
  subtitle: string;
  recommendations: CompanionRecommendation[];
  completedIds: Set<string>;
  onApprove?: (item: CompanionRecommendation) => void;
  onOpen?: (item: CompanionRecommendation) => void;
}) {
  const top = recommendations.slice(0, 3);
  return (
    <section className="surface p-4" style={{ borderColor: BORDER }}>
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 rounded-2xl p-2" style={{ background: '#FFE1E0', color: CORAL }}>
          <TriangleAlert className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: NAVY }}>{title}</h2>
          <p className="mt-0.5 text-xs" style={{ color: MUTED }}>{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">
        {top.length === 0 ? (
          <p className="rounded-lg px-3 py-2 text-xs" style={{ background: CREAM, color: MUTED }}>
            Nothing urgent here right now.
          </p>
        ) : (
          top.map((item) => (
            <RecommendationRow
              key={item.id}
              item={item}
              done={completedIds.has(item.id)}
              compact
              onApprove={onApprove}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </section>
  );
}

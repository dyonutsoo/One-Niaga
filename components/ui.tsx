'use client';

import React, { useRef, useState } from 'react';
import { CheckCircle2, CreditCard, Globe, Lock, Sparkles, TriangleAlert, X, Zap, type LucideIcon } from 'lucide-react';
import { AMBER, BORDER, CORAL, CREAM, GREEN, INK, MUTED, NAVY } from '@/lib/theme';
import { UI_LANGUAGES } from '@/lib/platforms';
import { useLang } from '@/lib/i18n';
import type { PlatformId, TabId, Toast, UiLang } from '@/lib/types';
import { PLATFORMS } from '@/lib/platforms';

// ============================================================================
// Page chrome
// ============================================================================

export function PageHeader({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-4 sm:px-8 pt-8 pb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow && <div className="text-xs font-semibold text-slate-400">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight mt-1" style={{ color: NAVY }}>{title}</h1>
        {desc && <p className="text-sm mt-1.5 max-w-2xl" style={{ color: MUTED }}>{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export function Locked({
  subscribed,
  setTab,
  children,
}: {
  subscribed: boolean;
  setTab: (tab: TabId) => void;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  if (subscribed) return <>{children}</>;
  return (
    <div>
      <PageHeader eyebrow={t('locked.eyebrow')} title={t('locked.title')} desc={t('locked.desc')} />
      <div className="px-4 sm:px-8 py-10">
        <div className="surface p-10 text-center">
          <Lock size={26} className="mx-auto mb-3" style={{ color: CORAL }} />
          <div className="font-semibold text-sm" style={{ color: NAVY }}>{t('locked.title')}</div>
          <p className="text-[13px] mt-1.5 max-w-sm mx-auto" style={{ color: MUTED }}>{t('locked.body')}</p>
          <button onClick={() => setTab('subscription')} className="primary-button mt-5">
            <CreditCard size={15} /> {t('locked.cta')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LangPicker({ lang, setLang, dark }: { lang: UiLang; setLang: (l: UiLang) => void; dark?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: dark ? '#F6F8FB' : CREAM }}>
      <Globe size={13} style={{ color: MUTED }} />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as UiLang)}
        className="bg-transparent text-[12px] font-medium outline-none"
        style={{ color: INK }}
      >
        {UI_LANGUAGES.map((l) => (
          <option key={l.id} value={l.id} style={{ color: INK }}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// Micro-interactions
// ============================================================================

// Retain the shared card API with a stable surface for easier reading.
export function TiltCard({
  children,
  className,
  style,
  maxTilt,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
}) {
  return <div className={className} style={style}>{children}</div>;
}

// Staggered fade-up entrance for a list of items — pure CSS, no dependency.
export function AnimatedList({
  children,
  className,
  itemClassName,
  staggerMs = 60,
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  staggerMs?: number;
}) {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <div
          key={(child as { key?: React.Key }).key ?? i}
          className={itemClassName}
          style={{ animation: 'slide-in-fade 320ms ease-out both', animationDelay: `${i * staggerMs}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export function StockTooltip({
  active,
  payload,
  t,
}: {
  active?: boolean;
  payload?: { payload: { name: string; daysLeft: number; stock: number } }[];
  t: (key: string) => string;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 11px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{d.name}</div>
      <div style={{ fontSize: 11.5, color: MUTED }}>{d.daysLeft} {t('overview.daysLeft')}</div>
      <div style={{ fontSize: 11.5, color: MUTED }}>{d.stock} {t('products.units')} {t('overview.inStock')}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'warn';
}) {
  return (
    <TiltCard className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium" style={{ color: MUTED }}>{label}</span>
        <Icon size={16} style={{ color: tone === 'warn' ? CORAL : NAVY }} />
      </div>
      <div className="text-2xl font-bold mt-2" style={{ color: NAVY }}>{value}</div>
    </TiltCard>
  );
}

// ============================================================================
// Inventory-sync engine — shared bits
// ============================================================================

export function ChannelBadge({ ch, size = 'sm' }: { ch: PlatformId; size?: 'sm' | 'xs' }) {
  const info = PLATFORMS.find((p) => p.id === ch)!;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md font-medium"
      style={{
        background: `${info.color}18`,
        color: info.color,
        border: `1px solid ${info.color}40`,
        padding: size === 'xs' ? '2px 6px' : '4px 8px',
        fontSize: size === 'xs' ? 10 : 12,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: info.color }} />
      {info.name}
    </span>
  );
}

const STATUS_PILL_TONES: Record<string, { fg: string; bg: string }> = {
  emerald: { fg: GREEN, bg: '#E3EFE9' },
  amber: { fg: AMBER, bg: '#F6EBD8' },
  rose: { fg: '#506CC7', bg: '#EEF2FB' },
  slate: { fg: MUTED, bg: '#EDEDED' },
  indigo: { fg: NAVY, bg: '#E7EAF2' },
};

export function StatusPill({ tone, children }: { tone: 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo'; children: React.ReactNode }) {
  const c = STATUS_PILL_TONES[tone];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: c.bg, color: c.fg }}>
      {children}
    </span>
  );
}

export function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent: 'navy' | 'green' | 'amber' | 'coral';
}) {
  const accentColor = { navy: NAVY, green: GREEN, amber: AMBER, coral: CORAL }[accent];
  return (
    <div className="surface flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${accentColor}14` }}>
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: MUTED }}>{label}</div>
        <div className="truncate text-lg font-bold tabular" style={{ color: NAVY }}>{value}</div>
        {sub && <div className="truncate text-[11px]" style={{ color: '#9AA0AC' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// Toasts
// ============================================================================

export function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const toneColor: Record<Toast['tone'], string> = { success: GREEN, info: NAVY, warning: CORAL };
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'warning' ? TriangleAlert : Sparkles;
        return (
          <div
            key={t.id}
            className="animate-toast-in pointer-events-auto flex items-start gap-3 rounded-lg p-3.5 shadow-2xl"
            style={{ background: 'white', border: `1px solid ${BORDER}` }}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: toneColor[t.tone] }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: NAVY }}>{t.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: MUTED }}>{t.description}</p>
            </div>
            <button onClick={() => onDismiss(t.id)} className="shrink-0 rounded-md p-1" style={{ color: '#9AA0AC' }} aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Action Console recommendation card
// ============================================================================

export function RecommendationCard({
  accent,
  icon: Icon,
  badge,
  title,
  subtitle,
  metrics,
  riskLabel,
  riskValue,
  children,
  actionLabel,
  doneLabel,
  done,
  onAction,
}: {
  accent: 'coral' | 'amber' | 'navy';
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle: string;
  metrics: { label: string; value: string }[];
  riskLabel: string;
  riskValue: string;
  children?: React.ReactNode;
  actionLabel: string;
  doneLabel: string;
  done: boolean;
  onAction: () => void;
}) {
  const accentColor = { coral: CORAL, amber: AMBER, navy: NAVY }[accent];
  return (
    <div className="surface overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accentColor}14` }}>
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div>
            <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: `${accentColor}14`, color: accentColor }}>
              {badge}
            </span>
            <h3 className="mt-1 text-base font-bold leading-tight" style={{ color: NAVY }}>{title}</h3>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed" style={{ color: MUTED }}>{subtitle}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg px-2.5 py-2" style={{ background: CREAM }}>
              <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: '#9A927E' }}>{m.label}</div>
              <div className="mt-0.5 text-sm font-bold tabular" style={{ color: NAVY }}>{m.value}</div>
            </div>
          ))}
        </div>

        {children}

        <div className="mt-4 flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: CREAM }}>
          <span className="text-[11px] font-medium" style={{ color: MUTED }}>{riskLabel}</span>
          <span className="text-sm font-extrabold tabular" style={{ color: CORAL }}>{riskValue}</span>
        </div>

        <button
          onClick={onAction}
          disabled={done}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: done ? GREEN : NAVY, opacity: done ? 0.85 : 1, cursor: done ? 'default' : 'pointer' }}
        >
          {done ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> {doneLabel}
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" /> {actionLabel}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

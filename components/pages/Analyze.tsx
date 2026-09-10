'use client';

import { useState } from 'react';
import { LineChart as LineChartIcon, Loader2, RefreshCw } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BORDER, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { WEEKLY_SALES } from '@/lib/seed';
import { useLang } from '@/lib/i18n';
import { useBilling } from '@/lib/billing';
import { AiAllowance } from '../AiAllowance';
import type { PlatformId } from '@/lib/types';

const PLATFORM_LINE_COLORS: Record<string, string> = {
  Shopee: '#FB725D',
  Lazada: '#7DD3FC',
  'TikTok Shop': '#EE4EA0',
  Webstore: '#F5C738',
};

export function Analyze({ onManageAi, platforms }: { onManageAi: () => void; platforms: PlatformId[] }) {
  const { t, lang } = useLang();
  const { aiFetch, remaining } = useBilling();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  async function analyze() {
    if (remaining === 0) {
      onManageAi();
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await aiFetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, platforms }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setSummary(json.summary.trim());
    } catch (e) {
      setError(`${t('analyze.error')} (${e instanceof Error ? e.message : 'unknown error'})`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <header className="px-4 pb-4 pt-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#EE4EA0]">{t('nav.analyze')}</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#090b18]">{t('analyze.title')}</h1>
            <p className="mt-2 max-w-3xl text-sm text-[#85847e]">{t('analyze.desc')}</p>
          </div>
          <div className="hidden rounded-full bg-white/60 px-4 py-2 text-xs font-medium text-[#090b18] sm:block">
            7-day connected view
          </div>
        </div>
      </header>
      <AiAllowance onManage={onManageAi} />
      <div className="space-y-6 px-4 py-6 sm:px-8">
        <section className="surface overflow-hidden p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-sm" style={{ color: NAVY }}>{t('analyze.chartTitle')}</div>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>Signal view of channel momentum across the last 7 days.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-medium" style={{ color: MUTED }}>
              <span className="h-2 w-2 rounded-full bg-[#EE4EA0]" />
              Live demo data
            </div>
          </div>
          <div className="rounded-[26px] bg-[#0a0e1d] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_24px_60px_rgba(10,14,29,.14)]">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={WEEKLY_SALES} margin={{ left: -8, right: 18, top: 18, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 8" stroke="rgba(255,255,255,.12)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'rgba(255,255,255,.62)' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,.16)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,.54)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 18, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(10,14,29,.94)', color: '#fff', boxShadow: '0 18px 44px rgba(0,0,0,.26)' }}
                  labelStyle={{ color: 'rgba(255,255,255,.7)' }}
                  formatter={(value: number) => [`RM ${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend wrapperStyle={{ paddingTop: 12, color: 'rgba(255,255,255,.72)' }} />
                {PLATFORMS.map((p) => (
                  <Line
                    key={p.name}
                    type="monotone"
                    dataKey={p.name}
                    stroke={PLATFORM_LINE_COLORS[p.name] ?? p.color}
                    strokeWidth={2.8}
                    isAnimationActive={false}
                    dot={{ r: 3, strokeWidth: 2, fill: '#0A0E1D' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="surface p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 font-semibold text-sm text-[#090b18]">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70">
                <LineChartIcon size={17} style={{ color: '#EE4EA0' }} />
              </span>
              {t('analyze.aiTitle')}
            </div>
            <button onClick={analyze} disabled={loading} className="primary-button flex items-center gap-1.5 text-xs font-semibold" style={{ background: remaining === 0 ? '#FB725D' : NAVY, opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {loading ? t('analyze.thinking') : remaining === 0 ? 'Upgrade to continue' : t('analyze.explain')}
            </button>
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          {summary ? (
            <p className="rounded-2xl bg-white/60 p-4 text-[14px] leading-relaxed text-[#090b18]">{summary}</p>
          ) : (
            !loading && <p className="text-[13px]" style={{ color: MUTED }}>{t('analyze.empty')}</p>
          )}
        </section>
      </div>
    </div>
  );
}

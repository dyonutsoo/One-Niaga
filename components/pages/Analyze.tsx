'use client';

import { useState } from 'react';
import { LineChart as LineChartIcon, Loader2, RefreshCw } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BORDER, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { WEEKLY_SALES } from '@/lib/seed';
import { useLang } from '@/lib/i18n';
import { useBilling } from '@/lib/billing';
import { PageHeader } from '../ui';
import { AiAllowance } from '../AiAllowance';

const PLATFORM_LINE_COLORS: Record<string, string> = {
  Shopee: '#EE4D2D',
  Lazada: '#0F146D',
  'TikTok Shop': '#12968C',
  Webstore: '#5B4B8A',
};

export function Analyze({ onManageAi }: { onManageAi: () => void }) {
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
        body: JSON.stringify({ lang }),
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
    <div>
      <PageHeader eyebrow={t('nav.analyze')} title={t('analyze.title')} desc={t('analyze.desc')} />
      <AiAllowance onManage={onManageAi} />
      <div className="px-4 sm:px-8 py-6 space-y-5">
        <div className="rounded-xl p-5" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="font-semibold text-sm mb-3" style={{ color: NAVY }}>{t('analyze.chartTitle')}</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={WEEKLY_SALES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEEAE0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke={MUTED} />
              <YAxis tick={{ fontSize: 12 }} stroke={MUTED} />
              <Tooltip />
              <Legend />
              {PLATFORMS.map((p) => (
                <Line key={p.name} type="monotone" dataKey={p.name} stroke={PLATFORM_LINE_COLORS[p.name] ?? p.color} strokeWidth={2.5} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
              <LineChartIcon size={16} style={{ color: '#506CC7' }} /> {t('analyze.aiTitle')}
            </div>
            <button onClick={analyze} disabled={loading} className="primary-button flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5" style={{ background: remaining === 0 ? '#E8552F' : NAVY, opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {loading ? t('analyze.thinking') : remaining === 0 ? 'Upgrade to continue' : t('analyze.explain')}
            </button>
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          {summary ? (
            <p className="text-[14px] leading-relaxed text-slate-700">{summary}</p>
          ) : (
            !loading && <p className="text-[13px]" style={{ color: MUTED }}>{t('analyze.empty')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

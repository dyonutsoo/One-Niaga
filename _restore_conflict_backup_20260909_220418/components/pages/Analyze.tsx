'use client';

import { useState } from 'react';
import { LineChart as LineChartIcon, Loader2, RefreshCw } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BORDER, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { WEEKLY_SALES } from '@/lib/seed';
import { useBilling } from '@/lib/billing';
import { useLang } from '@/lib/i18n';
import { PageHeader } from '../ui';

const PLATFORM_LINE_COLORS: Record<string, string> = {
  Shopee: '#EE4D2D',
  Lazada: '#0F146D',
  'TikTok Shop': '#12968C',
  Webstore: '#5B4B8A',
};

export function Analyze() {
  const { t, lang } = useLang();
  const { aiFetch, remaining } = useBilling();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  async function analyze() {
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
      setError(`${t('analyze.error')} (${e instanceof Error ? e.message === 'AI_LIMIT_REACHED' ? t('billing.exhausted') : e.message : 'unknown error'})`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow={t('nav.analyze')} title={t('analyze.title')} desc={t('analyze.desc')} />
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
        <div className="rounded-xl p-5" style={{ background: NAVY }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <LineChartIcon size={16} style={{ color: '#E8552F' }} /> {t('analyze.aiTitle')}
            </div>
            <button onClick={analyze} disabled={loading || remaining === 0} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: '#E8552F', opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {loading ? t('analyze.thinking') : t('analyze.explain')}
            </button>
          </div>
          {error && <p className="text-xs" style={{ color: '#F3A98D' }}>{error}</p>}
          {summary ? (
            <p className="text-[14px] leading-relaxed" style={{ color: '#E4E8F2' }}>{summary}</p>
          ) : (
            !loading && <p className="text-[13px]" style={{ color: '#8A93AC' }}>{t('analyze.empty')}</p>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { AMBER, BORDER, CORAL, GREEN, MUTED } from '@/lib/theme';
import { useLang } from '@/lib/i18n';
import { useBilling } from '@/lib/billing';
import { AnimatedList, PageHeader } from '../ui';
import { AiAllowance } from '../AiAllowance';
import type { Order, Priority, Product } from '@/lib/types';

export function Advise({ products, orders, onManageAi }: { products: Product[]; orders: Order[]; onManageAi: () => void }) {
  const { t, lang } = useLang();
  const { aiFetch, remaining } = useBilling();
  const [loading, setLoading] = useState(false);
  const [priorities, setPriorities] = useState<Priority[] | null>(null);
  const [error, setError] = useState('');

  async function generate() {
    if (remaining === 0) {
      onManageAi();
      return;
    }
    setLoading(true);
    setError('');
    setPriorities(null);
    try {
      const res = await aiFetch('/api/advise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, orders, lang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setPriorities(json.priorities);
    } catch (e) {
      setError(`${t('advise.error')} (${e instanceof Error ? e.message : 'unknown error'})`);
    } finally {
      setLoading(false);
    }
  }

  const levelColor: Record<string, string> = { high: CORAL, medium: AMBER, low: GREEN };
  const levelBg: Record<string, string> = { high: '#EEF2FB', medium: '#FFF4DE', low: '#E3EFE9' };

  return (
    <div>
      <PageHeader eyebrow={t('nav.advise')} title={t('advise.title')} desc={t('advise.desc')} />
      <AiAllowance onManage={onManageAi} />
      <div className="px-4 sm:px-8 py-6">
        <div className="surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Sparkles size={18} style={{ color: '#506CC7' }} /> {t('advise.cardTitle')}
            </div>
            <button onClick={generate} disabled={loading} className="primary-button flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2" style={{ background: remaining === 0 ? '#E8552F' : undefined, opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {loading ? t('advise.thinking') : remaining === 0 ? 'Upgrade to continue' : t('advise.generate')}
            </button>
          </div>
          {error && <p className="text-xs mb-3 text-rose-600">{error}</p>}
          {!priorities && !loading && <p className="text-sm" style={{ color: MUTED }}>{t('advise.empty')}</p>}
          <AnimatedList className="space-y-2.5" staggerMs={80}>
            {priorities &&
              priorities.map((p, i) => (
                <div key={i} className="rounded-xl p-4 flex items-start gap-3 border border-slate-100 bg-slate-50">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-0.5" style={{ background: levelBg[p.level] || levelBg.low, color: levelColor[p.level] || levelColor.low }}>{(p.level || 'low').toUpperCase()}</span>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{p.title}</div>
                    <div className="text-[13px] mt-0.5" style={{ color: MUTED }}>{p.reason}</div>
                  </div>
                </div>
              ))}
          </AnimatedList>
        </div>
        <div className="mt-5 rounded-xl p-4 text-[12.5px]" style={{ background: 'white', border: `1px solid ${BORDER}`, color: MUTED }}>{t('advise.note')}</div>
      </div>
    </div>
  );
}

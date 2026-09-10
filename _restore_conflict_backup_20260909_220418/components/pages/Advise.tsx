'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { AMBER, BORDER, CORAL, GREEN, MUTED, NAVY, NAVY_LIGHT } from '@/lib/theme';
import { useBilling } from '@/lib/billing';
import { useLang } from '@/lib/i18n';
import { AnimatedList, PageHeader } from '../ui';
import type { Order, Priority, Product } from '@/lib/types';

export function Advise({ products, orders }: { products: Product[]; orders: Order[] }) {
  const { t, lang } = useLang();
  const { aiFetch, remaining } = useBilling();
  const [loading, setLoading] = useState(false);
  const [priorities, setPriorities] = useState<Priority[] | null>(null);
  const [error, setError] = useState('');

  async function generate() {
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
      setError(`${t('advise.error')} (${e instanceof Error ? e.message === 'AI_LIMIT_REACHED' ? t('billing.exhausted') : e.message : 'unknown error'})`);
    } finally {
      setLoading(false);
    }
  }

  const levelColor: Record<string, string> = { high: CORAL, medium: AMBER, low: GREEN };
  const levelBg: Record<string, string> = { high: '#FBE4DB', medium: '#F6EBD8', low: '#E3EFE9' };

  return (
    <div>
      <PageHeader eyebrow={t('nav.advise')} title={t('advise.title')} desc={t('advise.desc')} />
      <div className="px-4 sm:px-8 py-6">
        <div className="rounded-2xl p-6" style={{ background: NAVY, boxShadow: '0 8px 30px rgba(27,42,74,0.25)' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-white font-bold">
              <Sparkles size={18} style={{ color: '#E8552F' }} /> {t('advise.cardTitle')}
            </div>
            <button onClick={generate} disabled={loading || remaining === 0} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg text-white" style={{ background: '#E8552F', opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {loading ? t('advise.thinking') : t('advise.generate')}
            </button>
          </div>
          {error && <p className="text-xs mb-3" style={{ color: '#F3A98D' }}>{error}</p>}
          {!priorities && !loading && <p className="text-sm" style={{ color: '#9AA6C0' }}>{t('advise.empty')}</p>}
          <AnimatedList className="space-y-2.5" staggerMs={80}>
            {priorities &&
              priorities.map((p, i) => (
                <div key={i} className="rounded-xl p-4 flex items-start gap-3" style={{ background: NAVY_LIGHT }}>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-0.5" style={{ background: levelBg[p.level] || levelBg.low, color: levelColor[p.level] || levelColor.low }}>{(p.level || 'low').toUpperCase()}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{p.title}</div>
                    <div className="text-[13px] mt-0.5" style={{ color: '#B7C0D8' }}>{p.reason}</div>
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


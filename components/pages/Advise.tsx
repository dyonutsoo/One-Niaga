'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { AMBER, BORDER, CORAL, GREEN, MUTED, NAVY } from '@/lib/theme';
import { useLang } from '@/lib/i18n';
import { useBilling } from '@/lib/billing';
import { AnimatedList } from '../ui';
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
    <div className="mx-auto max-w-[1440px]">
      <header className="px-4 pb-4 pt-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#EE4EA0]">{t('nav.advise')}</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#090b18]">{t('advise.title')}</h1>
            <p className="mt-2 max-w-3xl text-sm text-[#85847e]">{t('advise.desc')}</p>
          </div>
          <div className="hidden rounded-full bg-white/60 px-4 py-2 text-xs font-medium text-[#090b18] sm:block">
            Decision workspace
          </div>
        </div>
      </header>
      <AiAllowance onManage={onManageAi} />
      <div className="space-y-6 px-4 py-6 sm:px-8">
        <section className="surface overflow-hidden p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 font-semibold text-[#090b18]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70">
                <Sparkles size={18} style={{ color: '#EE4EA0' }} />
              </span>
              <div>
                <div>{t('advise.cardTitle')}</div>
                <p className="mt-1 text-xs font-normal text-[#85847e]">Generate a practical priority list from inventory, orders, returns, and pricing signals.</p>
              </div>
            </div>
            <button onClick={generate} disabled={loading} className="primary-button flex items-center gap-1.5 text-xs font-semibold" style={{ background: remaining === 0 ? '#FB725D' : NAVY, opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {loading ? t('advise.thinking') : remaining === 0 ? 'Upgrade to continue' : t('advise.generate')}
            </button>
          </div>
          {error && <p className="text-xs mb-3 text-rose-600">{error}</p>}
          {!priorities && !loading && (
            <div className="rounded-[24px] bg-gradient-to-br from-white/80 to-[#fff1f6] p-6">
              <p className="text-sm" style={{ color: MUTED }}>{t('advise.empty')}</p>
            </div>
          )}
          <AnimatedList className="space-y-3" staggerMs={80}>
            {priorities &&
              priorities.map((p, i) => (
                <div key={i} className="flex items-start gap-4 rounded-[22px] border border-white/70 bg-white/60 p-4 shadow-[0_14px_34px_rgba(44,42,36,.05)]">
                  <span className="mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: levelBg[p.level] || levelBg.low, color: levelColor[p.level] || levelColor.low }}>{(p.level || 'low').toUpperCase()}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#090b18]">{p.title}</div>
                    <div className="mt-1 text-[13px] leading-relaxed" style={{ color: MUTED }}>{p.reason}</div>
                  </div>
                </div>
              ))}
          </AnimatedList>
        </section>
        <section className="surface px-4 py-3 text-[12.5px]" style={{ borderColor: BORDER, color: MUTED }}>{t('advise.note')}</section>
      </div>
    </div>
  );
}

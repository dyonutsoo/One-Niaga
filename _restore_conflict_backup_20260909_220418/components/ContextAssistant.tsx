'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useBilling } from '@/lib/billing';
import { useLang } from '@/lib/i18n';
import type { Order, Product, Priority, PlatformId, TabId } from '@/lib/types';

type Result = { summary?: string; priorities?: Priority[] };
const Cache = createContext<{ values: Record<string, Result>; save: (key: string, value: Result) => void }>({ values: {}, save: () => {} });
export function AssistantProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, Result>>({});
  return <Cache.Provider value={{ values, save: (key, value) => setValues(prev => ({ ...prev, [key]: value })) }}>{children}</Cache.Provider>;
}
export function ContextAssistant({ mode, products = [], orders = [], platforms, onNavigate }: { mode: 'sales' | 'priorities'; products?: Product[]; orders?: Order[]; platforms: PlatformId[]; onNavigate: (tab: TabId) => void }) {
  const { t, lang } = useLang();
  const { aiFetch, remaining } = useBilling();
  const cache = useContext(Cache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const body = mode === 'sales' ? { lang, platforms } : { lang, products, orders, platforms };
  const key = `${mode}:${JSON.stringify(body)}`;
  const result = cache.values[key];
  async function generate() {
    if (loading || remaining === 0) return;
    setLoading(true); setError('');
    try {
      const response = await aiFetch(`/api/${mode === 'sales' ? 'analyze' : 'advise'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      cache.save(key, json);
    } catch { setError(t('assist.unavailable')); }
    finally { setLoading(false); }
  }
  return <div className="ai-panel">
    <div className="flex gap-3 items-start"><span className="ai-icon"><Sparkles size={17} /></span><div className="flex-1 min-w-0"><h3 className="font-semibold text-sm">{t(`assist.${mode}Title`)}</h3><p className="text-xs text-slate-600 mt-1 leading-relaxed">{t(`assist.${mode}Hint`)}</p></div></div>
    {result?.summary && <p className="mt-4 text-sm leading-relaxed text-slate-700">{result.summary}</p>}
    {result?.priorities && <ol className="mt-4 space-y-3">{result.priorities.map((p, i) => <li key={i} className="rounded-lg bg-white/80 p-3 flex gap-3"><span className="text-orange-700 text-sm font-semibold">{i + 1}</span><div><h4 className="text-sm font-semibold">{p.title}</h4><p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.reason}</p></div></li>)}</ol>}
    {error && <p role="alert" className="text-xs text-rose-700 mt-3">{error}</p>}
    <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={generate} disabled={loading || remaining === 0 || platforms.length === 0} className="ai-button">{loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{loading ? t('assist.working') : result ? t('assist.refresh') : t(`assist.${mode}Action`)}</button><span className="text-xs text-slate-500">{t('assist.cost')} · {remaining} {t('assist.left')}</span></div>
    {remaining === 0 && <button onClick={() => onNavigate('subscription')} className="text-xs text-orange-700 mt-3 underline">{t('billing.exhausted')}</button>}
    {result?.priorities && <div className="flex flex-wrap gap-4 mt-4">{(['products', 'orders'] as TabId[]).map(tab => <button key={tab} onClick={() => onNavigate(tab)} className="text-xs text-slate-600 inline-flex items-center gap-1 py-1">{t(`nav.${tab}`)}<ArrowRight size={13} /></button>)}</div>}
  </div>;
}

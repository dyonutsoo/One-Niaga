'use client';
import { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { useBilling } from '@/lib/billing';
import { useLang } from '@/lib/i18n';
import { CONTENT_LANGUAGES, PLATFORMS } from '@/lib/platforms';
import type { ContentLang, PlatformId, Product } from '@/lib/types';
const listingPlatforms = PLATFORMS.filter(p => p.id !== 'webstore');
export function ProductAssistant({ product, setProducts, onManage }: { product: Product; setProducts: (fn: (prev: Product[]) => Product[]) => void; onManage: () => void }) {
  const { t } = useLang();
  const { aiFetch, remaining } = useBilling();
  const [language, setLanguage] = useState<ContentLang>('en');
  const [platform, setPlatform] = useState<PlatformId>('shopee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasDraft = listingPlatforms.some(p => product.descriptions?.[p.id]);
  async function generate() {
    if (loading || remaining === 0) return;
    setLoading(true); setError('');
    try {
      const response = await aiFetch('/api/automate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: product.name, category: product.category, features: product.features, price: product.price, contentLang: language }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, descriptions: { ...p.descriptions, shopee: json.shopee, lazada: json.lazada, tiktok: json.tiktok }, published: { ...p.published, shopee: false, lazada: false, tiktok: false } } : p));
    } catch { setError(t('assist.unavailable')); }
    finally { setLoading(false); }
  }
  function edit(value: string) {
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, descriptions: { ...p.descriptions, [platform]: value }, published: { ...p.published, [platform]: false } } : p));
  }
  return <section className="ai-panel">
    <div className="flex items-start gap-3"><span className="ai-icon"><Sparkles size={18} /></span><div><h3 className="font-semibold text-sm">{t('assist.listingTitle')}</h3><p className="text-xs text-slate-600 mt-1">{t('assist.listingHint')}</p></div></div>
    <div className="my-4 rounded-lg bg-white/70 p-3 text-xs text-slate-600"><span className="font-medium">{t('assist.using')}</span> {product.name} · RM {product.price}<p className="mt-1 leading-relaxed">{product.features}</p></div>
    <div className="flex flex-wrap items-end gap-3"><label className="text-xs text-slate-600">{t('automate.language')}<select value={language} onChange={e => setLanguage(e.target.value as ContentLang)} className="block mt-1 rounded-lg border border-slate-200 bg-white p-2 text-sm">{CONTENT_LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label><button onClick={generate} disabled={loading || remaining === 0 || !product.features.trim()} className="ai-button">{loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{loading ? t('assist.working') : hasDraft ? t('assist.redraft') : t('assist.draftListings')}</button><span className="text-xs text-slate-500 py-2">{t('assist.cost')} · {remaining} {t('assist.left')}</span></div>
    {remaining === 0 && <button onClick={onManage} className="text-xs text-orange-700 underline mt-3">{t('billing.exhausted')}</button>}
    {error && <p role="alert" className="text-xs text-rose-700 mt-3">{error}</p>}
    {hasDraft && <div className="mt-5"><div className="flex flex-wrap gap-2 mb-3">{listingPlatforms.map(p => <button key={p.id} aria-pressed={platform === p.id} onClick={() => setPlatform(p.id)} className={`rounded-lg px-3 py-2 text-xs ${platform === p.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>{p.name}</button>)}</div><textarea aria-label={`${t('assist.draftLabel')} ${platform}`} value={product.descriptions?.[platform] || ''} onChange={e => edit(e.target.value)} rows={6} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed" /><div className="flex flex-wrap items-center justify-between gap-3 mt-2"><p className="text-xs text-slate-500 max-w-sm">{t('assist.reviewDraft')}</p><button disabled={!product.descriptions?.[platform]?.trim() || product.published[platform]} className="ai-button" onClick={() => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, published: { ...p.published, [platform]: true } } : p))}>{product.published[platform] ? <><Check size={14} />{t('automate.published')}</> : t('automate.publish')}</button></div></div>}
  </section>;
}

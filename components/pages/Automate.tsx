'use client';

import { useRef, useState } from 'react';
import { Camera, Check, Loader2, UploadCloud, Wand2 } from 'lucide-react';
import { BORDER, CREAM, GREEN, MUTED, NAVY } from '@/lib/theme';
import { CONTENT_LANGUAGES, PLATFORMS } from '@/lib/platforms';
import { useLang } from '@/lib/i18n';
import { useBilling } from '@/lib/billing';
import { PageHeader } from '../ui';
import { AiAllowance } from '../AiAllowance';
import type { ContentLang, PlatformId, Product } from '@/lib/types';

function ImageUpload({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }
  return (
    <div>
      <label className="text-[12px] font-medium block mb-1" style={{ color: MUTED }}>{t('automate.photo')}</label>
      <button type="button" onClick={() => inputRef.current?.click()} className="w-full h-28 rounded-lg flex flex-col items-center justify-center gap-1" style={{ border: `1px dashed ${BORDER}`, background: CREAM }}>
        {value ? (
          <img src={value} alt="Product" className="h-full rounded-lg object-cover" />
        ) : (
          <>
            <Camera size={18} style={{ color: '#B7AF9E' }} />
            <span className="text-[11px]" style={{ color: '#9A927E' }}>{t('automate.uploadHint')}</span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-[12px] font-medium block mb-1" style={{ color: MUTED }}>{label}</label>
      {textarea ? (
        <textarea className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: `1px solid ${BORDER}`, background: CREAM }} rows={2} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: `1px solid ${BORDER}`, background: CREAM }} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

type FormState = { name: string; category: string; features: string; price: string; image: string | null };

export function Automate({
  products,
  setProducts,
  selectedId,
  setSelectedId,
  onManageAi,
}: {
  products: Product[];
  setProducts: (updater: (prev: Product[]) => Product[]) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  onManageAi: () => void;
}) {
  const { t } = useLang();
  const { aiFetch, remaining } = useBilling();
  const isNew = selectedId === null;
  const selected = products.find((p) => p.id === selectedId);
  const [form, setForm] = useState<FormState>(
    selected
      ? { name: selected.name, category: selected.category, features: selected.features, price: selected.price, image: selected.image }
      : { name: '', category: '', features: '', price: '', image: null }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Partial<Record<PlatformId, string>> | null>(selected?.descriptions || null);
  const [publishing, setPublishing] = useState<PlatformId | null>(null);
  const [contentLang, setContentLang] = useState<ContentLang>('en');

  function selectProduct(id: number | null) {
    setSelectedId(id);
    if (id === null) {
      setForm({ name: '', category: '', features: '', price: '', image: null });
      setResult(null);
    } else {
      const p = products.find((pp) => pp.id === id);
      if (p) {
        setForm({ name: p.name, category: p.category, features: p.features, price: p.price, image: p.image });
        setResult(p.descriptions || null);
      }
    }
  }

  const canGenerate = form.name.trim() && form.features.trim();
  const currentProductId = isNew ? null : selectedId;

  async function generate() {
    if (remaining === 0) {
      onManageAi();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await aiFetch('/api/automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, category: form.category, features: form.features, price: form.price, contentLang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      const descriptions: Partial<Record<PlatformId, string>> = { shopee: json.shopee, lazada: json.lazada, tiktok: json.tiktok };
      setResult(descriptions);
      if (isNew) {
        const price = parseFloat(form.price) || 0;
        const newProduct: Product = {
          id: Date.now(),
          name: form.name,
          sku: 'NEW-' + Math.floor(Math.random() * 900 + 100),
          category: form.category,
          features: form.features,
          price: form.price,
          stock: 20,
          dailySales: 1.0,
          image: form.image,
          descriptions,
          masterStock: 20,
          reserved: 0,
          platformPrices: { shopee: price, lazada: price, tiktok: price, webstore: price },
          published: { shopee: false, lazada: false, tiktok: false, webstore: false },
          salesByPlatform: {
            shopee: { units: 0, revenue: 0 },
            lazada: { units: 0, revenue: 0 },
            tiktok: { units: 0, revenue: 0 },
            webstore: { units: 0, revenue: 0 },
          },
          returns: { shopee: { total: 0, reasons: {} }, lazada: { total: 0, reasons: {} }, tiktok: { total: 0, reasons: {} }, webstore: { total: 0, reasons: {} } },
          channels: {
            shopee: { externalId: `SP-${Math.floor(Math.random() * 900000 + 100000)}`, stock: 20, synced: true, lastSyncedAt: Date.now() },
            lazada: { externalId: `LZ-${Math.floor(Math.random() * 90000 + 10000)}`, stock: 0, synced: true, lastSyncedAt: Date.now() },
            tiktok: { externalId: `TT-PID-${Math.floor(Math.random() * 90000 + 10000)}`, stock: 0, synced: true, lastSyncedAt: Date.now() },
            webstore: { externalId: `WS-${Math.floor(Math.random() * 9000 + 1000)}`, stock: 0, synced: true, lastSyncedAt: Date.now() },
          },
        };
        setProducts((prev) => [...prev, newProduct]);
        setSelectedId(newProduct.id);
      } else {
        setProducts((prev) => prev.map((p) => (p.id === selectedId ? { ...p, ...form, descriptions } : p)));
      }
    } catch (e) {
      setError(`${t('automate.error')} (${e instanceof Error ? e.message : 'unknown error'})`);
    } finally {
      setLoading(false);
    }
  }

  function publish(platformId: PlatformId) {
    if (!currentProductId) return;
    setPublishing(platformId);
    setTimeout(() => {
      setProducts((prev) => prev.map((p) => (p.id === currentProductId ? { ...p, published: { ...p.published, [platformId]: true } } : p)));
      setPublishing(null);
    }, 800);
  }

  const livePublished = products.find((p) => p.id === currentProductId)?.published;

  return (
    <div>
      <PageHeader eyebrow={t('nav.automate')} title={t('automate.title')} desc={t('automate.desc')} />
      <AiAllowance onManage={onManageAi} />
      <div className="px-4 sm:px-8 pt-2 pb-4 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
        <div className="w-full sm:w-72">
          <label className="text-[12px] font-medium block mb-1" style={{ color: MUTED }}>{t('automate.product')}</label>
          <select className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={{ border: `1px solid ${BORDER}`, background: 'white' }} value={selectedId === null ? 'new' : selectedId} onChange={(e) => selectProduct(e.target.value === 'new' ? null : Number(e.target.value))}>
            <option value="new">{t('automate.newProduct')}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-52">
          <label className="text-[12px] font-medium block mb-1" style={{ color: MUTED }}>{t('automate.language')}</label>
          <select className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={{ border: `1px solid ${BORDER}`, background: 'white' }} value={contentLang} onChange={(e) => setContentLang(e.target.value as ContentLang)}>
            {CONTENT_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="px-4 sm:px-8 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
          <Field label={t('automate.name')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder={t('automate.namePh')} />
          <Field label={t('automate.category')} value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder={t('automate.categoryPh')} />
          <Field label={t('automate.features')} value={form.features} onChange={(v) => setForm({ ...form, features: v })} placeholder={t('automate.featuresPh')} textarea />
          <Field label={t('automate.price')} value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder={t('automate.pricePh')} />
          <button onClick={generate} disabled={!canGenerate || loading} className="primary-button mt-2 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold" style={{ background: canGenerate ? (remaining === 0 ? '#E8552F' : NAVY) : '#D9DCE5', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {loading ? t('automate.generating') : remaining === 0 ? 'Upgrade to continue' : t('automate.generate')}
          </button>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
        <div className="space-y-3">
          {!result && !loading && (
            <div className="rounded-xl p-8 text-center text-sm" style={{ background: 'white', border: `1px dashed ${BORDER}`, color: '#8A8F9C' }}>{t('automate.empty')}</div>
          )}
          {result &&
            PLATFORMS.filter((p) => p.id !== 'webstore').map((p) => {
              const isPublished = livePublished?.[p.id];
              return (
                <div key={p.id} className="rounded-xl p-4" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-xs font-bold" style={{ color: NAVY }}>{p.name}</span>
                    </div>
                    {isPublished ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: GREEN }}>
                        <Check size={12} /> {t('automate.published')}
                      </span>
                    ) : (
                      <button onClick={() => publish(p.id)} disabled={publishing === p.id} className="flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-1 rounded-md text-white" style={{ background: NAVY, opacity: publishing === p.id ? 0.6 : 1 }}>
                        {publishing === p.id ? <Loader2 size={11} className="animate-spin" /> : <UploadCloud size={11} />}
                        {publishing === p.id ? t('automate.publishing') : t('automate.publish')}
                      </button>
                    )}
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#1F2328' }}>{result[p.id]}</p>
                </div>
              );
            })}
          {result && <p className="text-[11px]" style={{ color: '#9AA6C0' }}>{t('automate.publishNote')}</p>}
        </div>
      </div>
    </div>
  );
}

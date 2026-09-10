'use client';

import { useState } from 'react';
import { Camera, Check, ChevronDown, ChevronRight, Loader2, TriangleAlert, UploadCloud, Wand2, X } from 'lucide-react';
import { BORDER, CREAM, GREEN, INK, MUTED, NAVY, PRODUCT_ROW_GRID_COLS } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { useLang } from '@/lib/i18n';
import { PageHeader } from '../ui';
import { ProductAssistant } from '../ProductAssistant';
import { CompanionPanel } from '../CompanionBrief';
import { priceSpread, topReturnReason, totalReturns } from '@/lib/utils';
import type { CompanionRecommendation, PlatformId, Product } from '@/lib/types';

export function ProductsPage({
  products,
  setProducts,
  onEdit,
  onManageAi,
  focus,
  setFocus,
  companionRecommendations = [],
  completedCompanionIds = new Set<string>(),
  onApproveCompanion,
  onOpenCompanion,
}: {
  products: Product[];
  setProducts: (updater: (prev: Product[]) => Product[]) => void;
  onEdit: (id: number) => void;
  onManageAi: () => void;
  focus: 'lowStock' | 'elevatedReturns' | null;
  setFocus: (f: 'lowStock' | 'elevatedReturns' | null) => void;
  companionRecommendations?: CompanionRecommendation[];
  completedCompanionIds?: Set<string>;
  onApproveCompanion?: (item: CompanionRecommendation) => void;
  onOpenCompanion?: (item: CompanionRecommendation) => void;
}) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  function publish(productId: number, platformId: PlatformId) {
    const key = `${productId}-${platformId}`;
    setPublishing(key);
    setTimeout(() => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, published: { ...p.published, [platformId]: true } } : p))
      );
      setPublishing(null);
    }, 800);
  }

  const filtered = !focus
    ? products
    : focus === 'lowStock'
    ? products.filter((p) => p.stock / p.dailySales < 3)
    : products.filter((p) => totalReturns(p.returns) > 2);

  const focusLabel = focus === 'lowStock' ? t('products.focusLowStock') : focus === 'elevatedReturns' ? t('products.focusReturns') : null;
  const productCompanionItems = companionRecommendations.filter((item) =>
    ['draft-po', 'fix-listing', 'standardize-pricing', 'reallocate-stock', 'liquidate-deadstock'].includes(item.actionType)
  );

  return (
    <div>
      <PageHeader eyebrow={t('nav.products')} title={t('products.title')} desc={t('products.desc')} />
      {focusLabel && (
        <div className="mx-4 sm:mx-8 mt-4 mb-1 flex items-center justify-between rounded-lg border px-4 py-2.5" style={{ background: '#EEF2FB', borderColor: '#DDE6FA' }}>
          <span className="text-[12.5px] font-semibold" style={{ color: '#506CC7' }}>{t('products.showing')}: {focusLabel}</span>
          <button onClick={() => setFocus(null)} className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#506CC7' }}>
            <X size={12} /> {t('products.clearFilter')}
          </button>
        </div>
      )}
      <div className="px-4 sm:px-8 pb-8 pt-4 space-y-3">
        <CompanionPanel
          title="Product companion"
          subtitle="Stock, price, listing, and channel warnings prepared from your catalog."
          recommendations={productCompanionItems}
          completedIds={completedCompanionIds}
          onApprove={onApproveCompanion}
          onOpen={onOpenCompanion}
        />

        {filtered.length === 0 && (
          <div className="rounded-xl p-8 text-center text-sm" style={{ background: 'white', border: `1px dashed ${BORDER}`, color: '#8A8F9C' }}>{t('products.focusEmpty')}</div>
        )}
        {filtered.map((p) => {
          const genCount = p.descriptions ? Object.values(p.descriptions).filter(Boolean).length : 0;
          const consistency =
            genCount === 3
              ? { label: t('products.synced'), fg: GREEN, bg: '#E3EFE9' }
              : genCount > 0
              ? { label: `${t('products.partial')} ${genCount}/3`, fg: '#B8791A', bg: '#F6EBD8' }
              : { label: t('products.notGenerated'), fg: MUTED, bg: '#EDEDED' };
          const spread = priceSpread(p.platformPrices);
          const priceWarning = spread > 3;
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} className="rounded-xl overflow-hidden" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
              <button onClick={() => setExpanded(isOpen ? null : p.id)} className="w-full flex items-center gap-3 p-4 text-left">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: CREAM }}>
                    <Camera size={18} style={{ color: '#B7AF9E' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: NAVY }}>{p.name}</div>
                  <div className="text-[11.5px]" style={{ color: MUTED }}>{p.sku}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: consistency.bg, color: consistency.fg }}>{consistency.label}</span>
                    {priceWarning && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EEF2FB', color: '#506CC7' }}>
                        <TriangleAlert size={10} /> {t('products.priceDiffers')} {spread.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {isOpen ? <ChevronDown size={16} style={{ color: MUTED }} /> : <ChevronRight size={16} style={{ color: MUTED }} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid #F0EDE6' }}>
                  <div className="pt-3 text-[12px]" style={{ color: MUTED }}>{p.features}</div>
                  <ProductAssistant product={p} setProducts={setProducts} onManage={onManageAi} />

                  <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    <div className="overflow-x-auto">
                      <div className="grid px-3 py-2 text-[10.5px] font-semibold gap-2" style={{ color: MUTED, background: CREAM, gridTemplateColumns: PRODUCT_ROW_GRID_COLS }}>
                        <div className="truncate">{t('products.colPlatform')}</div>
                        <div className="truncate">{t('products.colPrice')}</div>
                        <div className="truncate">{t('products.colPublish')}</div>
                        <div className="truncate">{t('products.colSales')}</div>
                        <div className="truncate">{t('products.colReturns')}</div>
                        <div className="truncate">{t('products.colReason')}</div>
                      </div>
                      {PLATFORMS.map((pl) => {
                        const sales = p.salesByPlatform?.[pl.id] || { units: 0, revenue: 0 };
                        const ret = p.returns?.[pl.id] || { total: 0, reasons: {} };
                        const top = topReturnReason(ret.reasons);
                        const isPublished = p.published?.[pl.id];
                        const pubKey = `${p.id}-${pl.id}`;
                        return (
                          <div key={pl.id} className="grid px-3 py-2.5 text-[11.5px] items-center gap-2" style={{ borderTop: '1px solid #F0EDE6', gridTemplateColumns: PRODUCT_ROW_GRID_COLS }}>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pl.color }} />
                              <span className="truncate">{pl.name}</span>
                            </div>
                            <div className="truncate" style={{ color: INK }}>RM {p.platformPrices?.[pl.id]?.toFixed(2) ?? '—'}</div>
                            <div className="truncate">
                              {isPublished ? (
                                <span className="flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: GREEN }}>
                                  <Check size={12} className="shrink-0" /> <span className="truncate">{t('automate.published')}</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => publish(p.id, pl.id)}
                                  disabled={publishing === pubKey || !p.descriptions?.[pl.id]}
                                  className="flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-md text-white whitespace-nowrap"
                                  style={{ background: p.descriptions?.[pl.id] ? NAVY : '#C7CEDD', opacity: publishing === pubKey ? 0.6 : 1 }}
                                >
                                  {publishing === pubKey ? <Loader2 size={11} className="animate-spin shrink-0" /> : <UploadCloud size={11} className="shrink-0" />}
                                  {publishing === pubKey ? t('automate.publishing') : t('automate.publish')}
                                </button>
                              )}
                            </div>
                            <div className="truncate" style={{ color: INK }} title={`${sales.units} ${t('products.units')} · RM ${sales.revenue}`}>{sales.units} {t('products.units')} · RM {sales.revenue}</div>
                            <div className="truncate" style={{ color: ret.total > 0 ? '#506CC7' : MUTED, fontWeight: ret.total > 0 ? 600 : 400 }}>{ret.total} {ret.total === 1 ? t('products.return1') : t('products.returnN')}</div>
                            <div className="truncate" style={{ color: MUTED }} title={top ? `${t(`returns.${top.key}`)} (${top.count})` : '—'}>{top ? `${t(`returns.${top.key}`)} (${top.count})` : '—'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {PLATFORMS.map((pl) => (
                      <div key={pl.id} className="rounded-lg p-2.5" style={{ background: CREAM }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: pl.color }} />
                          <span className="text-[11px] font-bold" style={{ color: NAVY }}>{pl.name}</span>
                        </div>
                        <p className="text-[12px]" style={{ color: p.descriptions?.[pl.id] ? INK : '#B0AA9C' }}>{p.descriptions?.[pl.id] || t('products.notGenerated')}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => onEdit(p.id)} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: NAVY }}>
                    <Wand2 size={12} /> {genCount > 0 ? t('products.regenerate') : t('products.generate')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Check, Loader2, Send, Wand2 } from 'lucide-react';
import { BORDER, CREAM, GREEN, INK, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { useLang } from '@/lib/i18n';
import { useBilling } from '@/lib/billing';
import { PageHeader } from '../ui';
import { AiAllowance } from '../AiAllowance';
import { CompanionPanel } from '../CompanionBrief';
import type { CompanionRecommendation, CustomerMessage, Product } from '@/lib/types';

export function MessagesPage({
  messages,
  setMessages,
  products,
  onManageAi,
  companionRecommendations = [],
  completedCompanionIds = new Set<string>(),
  onApproveCompanion,
  onOpenCompanion,
}: {
  messages: CustomerMessage[];
  setMessages: (updater: (prev: CustomerMessage[]) => CustomerMessage[]) => void;
  products: Product[];
  onManageAi: () => void;
  companionRecommendations?: CompanionRecommendation[];
  completedCompanionIds?: Set<string>;
  onApproveCompanion?: (item: CompanionRecommendation) => void;
  onOpenCompanion?: (item: CompanionRecommendation) => void;
}) {
  const { t } = useLang();
  const { aiFetch, remaining } = useBilling();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function draftReply(m: CustomerMessage) {
    if (remaining === 0) {
      onManageAi();
      return;
    }
    setLoadingId(m.id);
    setErrorId(null);
    const matchedProduct = products.find((p) => p.name === m.product);
    const listingText = matchedProduct?.descriptions?.[m.platform] ?? null;
    try {
      const res = await aiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: m.platform, product: m.product, listingText, message: m.message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      const reply = json.reply.trim();
      setMessages((prev) => prev.map((mm) => (mm.id === m.id ? { ...mm, draft: reply } : mm)));
    } catch (e) {
      setErrorId(m.id);
      setErrorMsg(e instanceof Error ? e.message : 'unknown error');
    } finally {
      setLoadingId(null);
    }
  }

  function updateDraft(id: string, text: string) {
    setMessages((prev) => prev.map((mm) => (mm.id === id ? { ...mm, draft: text } : mm)));
  }

  function send(m: CustomerMessage) {
    setMessages((prev) => prev.map((mm) => (mm.id === m.id ? { ...mm, replied: true } : mm)));
  }

  const messageCompanionItems = companionRecommendations.filter((item) => item.actionType === 'draft-reply');

  return (
    <div>
      <PageHeader eyebrow={t('nav.messages')} title={t('messages.title')} desc={t('messages.desc')} />
      <AiAllowance onManage={onManageAi} />
      <div className="px-4 sm:px-8 pb-8 space-y-3">
        <CompanionPanel
          title="Message companion"
          subtitle="OneNiaga highlights the buyer conversations most likely to affect trust."
          recommendations={messageCompanionItems}
          completedIds={completedCompanionIds}
          onApprove={onApproveCompanion}
          onOpen={onOpenCompanion}
        />

        {messages.map((m) => {
          const p = PLATFORMS.find((pl) => pl.id === m.platform)!;
          return (
            <div key={m.id} className="rounded-xl p-4" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-[11.5px]" style={{ color: MUTED }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                  <span className="font-semibold" style={{ color: NAVY }}>{m.customer}</span>
                  <span>· {p.name}</span>
                  <span>· {m.product}</span>
                </div>
                {m.replied && (
                  <span className="flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: GREEN }}>
                    <Check size={12} /> {t('messages.replied')}
                  </span>
                )}
              </div>
              <p className="text-[13px] mb-3" style={{ color: INK }}>{m.message}</p>

              {m.draft && !m.replied && (
                <div className="rounded-lg p-3 mb-2" style={{ background: CREAM }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{t('messages.editHint')}</span>
                    <span className="text-[10px]" style={{ color: '#9A927E' }}>{m.draft.length} chars</span>
                  </div>
                  <textarea className="w-full text-[12.5px] rounded-md px-2.5 py-2 outline-none resize-none" style={{ background: 'white', border: `1px solid ${BORDER}`, color: INK }} rows={3} value={m.draft} onChange={(e) => updateDraft(m.id, e.target.value)} />
                </div>
              )}
              {m.draft && m.replied && (
                <div className="rounded-lg p-3 mb-2" style={{ background: CREAM }}>
                  <div className="text-[10.5px] font-semibold mb-1" style={{ color: MUTED }}>{t('messages.sentLabel')}</div>
                  <p className="text-[12.5px]" style={{ color: INK }}>{m.draft}</p>
                </div>
              )}
              {errorId === m.id && <p className="text-[11px] mb-2 text-rose-600">{t('messages.error')} ({errorMsg})</p>}

              {!m.replied && (
                <div className="flex items-center gap-2">
                  <button onClick={() => draftReply(m)} disabled={loadingId === m.id} className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: remaining === 0 ? '#E8552F' : NAVY, opacity: loadingId === m.id ? 0.6 : 1 }}>
                    {loadingId === m.id ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    {loadingId === m.id ? t('messages.drafting') : remaining === 0 ? 'Upgrade to continue' : m.draft ? t('messages.regenDraft') : t('messages.draft')}
                  </button>
                  {m.draft && (
                    <button onClick={() => send(m)} disabled={!m.draft.trim()} className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: m.draft.trim() ? NAVY : '#D9DCE5' }}>
                      <Send size={12} /> {t('messages.send')}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

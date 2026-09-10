'use client';

import { useState } from 'react';
import { Check, Loader2, Send, Wand2 } from 'lucide-react';
import { BORDER, CREAM, GREEN, INK, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { useBilling } from '@/lib/billing';
import { useLang } from '@/lib/i18n';
import { PageHeader } from '../ui';
import type { CustomerMessage, Product } from '@/lib/types';

export function MessagesPage({
  messages,
  setMessages,
  products,
}: {
  messages: CustomerMessage[];
  setMessages: (updater: (prev: CustomerMessage[]) => CustomerMessage[]) => void;
  products: Product[];
}) {
  const { t } = useLang();
  const { aiFetch, remaining } = useBilling();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAll, setShowAll] = useState(false);
  const visibleMessages = showAll ? messages : messages.filter(m => !m.replied);

  async function draftReply(m: CustomerMessage) {
    setLoadingId(m.id);
    setErrorId(null);
    const matchedProduct = products.find((p) => p.name === m.product);
    const listingText = matchedProduct?.descriptions?.[m.platform] || matchedProduct?.features || null;
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
      setErrorMsg(e instanceof Error ? e.message === 'AI_LIMIT_REACHED' ? t('billing.exhausted') : e.message : 'unknown error');
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

  return (
    <div>
      <PageHeader eyebrow={t('nav.messages')} title={t('messages.title')} desc={t('messages.desc')} />
      <div className="px-4 sm:px-8 pb-8 space-y-3"><div className="ai-panel mb-5"><p className="text-sm text-slate-600">{t('assist.replyHint')}</p><div className="flex flex-wrap gap-2 mt-3"><button className="ai-button" aria-pressed={!showAll} onClick={() => setShowAll(false)}>{t('assist.needsReply')} ({messages.filter(m => !m.replied).length})</button><button className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white" aria-pressed={showAll} onClick={() => setShowAll(true)}>{t('assist.allMessages')}</button></div></div>{visibleMessages.length === 0 && <p className="surface p-8 text-sm text-slate-500">{t('assist.inboxEmpty')}</p>}
        {visibleMessages.map((m) => {
          const p = PLATFORMS.find((pl) => pl.id === m.platform)!;
          return (
            <div key={m.id} className="rounded-xl p-4" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex flex-wrap items-center gap-2 text-[11.5px]" style={{ color: MUTED }}>
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
              {errorId === m.id && <p className="text-[11px] mb-2" style={{ color: '#E8552F' }}>{t('messages.error')} ({errorMsg})</p>}

              {!m.replied && (
                <div className="flex items-center gap-2">
                  <button onClick={() => draftReply(m)} disabled={loadingId !== null || remaining === 0} className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: NAVY, opacity: loadingId === m.id ? 0.6 : 1 }}>
                    {loadingId === m.id ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    {loadingId === m.id ? t('messages.drafting') : m.draft ? t('messages.regenDraft') : t('messages.draft')}
                  </button>
                  {m.draft && (
                    <button onClick={() => send(m)} disabled={!m.draft.trim()} className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: m.draft.trim() ? '#E8552F' : '#D8B5A6' }}>
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



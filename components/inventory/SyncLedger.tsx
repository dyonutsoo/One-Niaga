'use client';
import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Clock3 } from 'lucide-react';
import { PLATFORMS } from '@/lib/platforms';
import { useLang } from '@/lib/i18n';
import { activityKey } from '@/lib/activity';
import { PageHeader } from '../ui';
import type { LedgerEvent } from '@/lib/types';
export function SyncLedger({ events, onInsertWebhook, liveFeed, onToggleLiveFeed }: { events: LedgerEvent[]; onInsertWebhook: () => void; liveFeed: boolean; onToggleLiveFeed: () => void }) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(12);
  const [showCalculations, setShowCalculations] = useState(false);
  const filtered = events.filter(e => (filter === 'all' || e.channel === filter) && (showCalculations || e.type !== 'CALC')).slice().sort((a,b) => b.ts - a.ts);
  const locale = lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY';
  return <div><PageHeader title={t('activity.title')} desc={t('activity.desc')} />
    <div className="px-4 sm:px-8 pb-8 space-y-5">
      <section className="surface p-5 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="bg-slate-50 text-slate-500 p-3 rounded-xl"><Clock3 size={20} /></span><div><h2 className="font-semibold text-sm">{t('activity.recent')}</h2><p className="text-xs text-slate-500 mt-1">{t('activity.demoNote')}</p></div></div><label className="text-xs text-slate-500">{t('activity.filter')}<select value={filter} onChange={e => { setFilter(e.target.value); setLimit(12); }} className="block mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><option value="all">{t('activity.all')}</option>{PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}<option value="SYSTEM">OneNiaga</option></select></label></section>
      <section className="surface overflow-hidden" aria-label={t('activity.recent')}>
        {filtered.length === 0 && <p className="p-8 text-sm text-slate-500">{t('activity.empty')}</p>}
        {filtered.slice(0,limit).map(event => {
          const Icon = event.type === 'INBOUND' ? ArrowDownLeft : event.type === 'CALC' ? RefreshCw : ArrowUpRight;
          return <article key={event.id} className="p-4 sm:p-5 border-b last:border-b-0 border-slate-100"><div className="flex items-start gap-3"><span className="rounded-lg bg-slate-50 text-slate-500 p-2"><Icon size={17} /></span><div className="flex-1 min-w-0"><div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><h3 className="font-medium text-sm">{t(activityKey(event))}</h3><time dateTime={new Date(event.ts).toISOString()} className="text-xs text-slate-500">{new Date(event.ts).toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div><p className="text-xs text-slate-500 mt-1">{event.channel === 'SYSTEM' ? 'OneNiaga' : PLATFORMS.find(p => p.id === event.channel)?.name}</p><details className="mt-2"><summary className="text-xs text-slate-500 cursor-pointer py-1">{t('activity.details')}</summary><div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 break-words"><p>{event.message}</p><p className="mt-2 text-slate-500">{event.id} · {event.type} · {event.latencyMs} ms</p></div></details></div></div></article>;
        })}
      </section>
      {filtered.length > limit && <button className="ai-button" onClick={() => setLimit(n => n + 12)}>{t('activity.more')}</button>}
      <details className="surface p-4"><summary className="text-sm text-slate-600 cursor-pointer">{t('activity.demoControls')}</summary><p className="text-xs text-slate-500 my-3">{t('activity.simulated')}</p><div className="flex flex-wrap gap-3 items-center"><button onClick={onInsertWebhook} className="ai-button">{t('activity.sample')}</button><button onClick={onToggleLiveFeed} aria-pressed={liveFeed} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">{t(liveFeed ? 'activity.pause' : 'activity.start')}</button><label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={showCalculations} onChange={e => { setShowCalculations(e.target.checked); setLimit(12); }} />{t('activity.calculations')}</label></div></details>
    </div>
  </div>;
}

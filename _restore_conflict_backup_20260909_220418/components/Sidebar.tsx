'use client';
import { useEffect, useRef, useState } from 'react';
import { Boxes, ClipboardList, LayoutDashboard, MessageCircle, Settings, ChevronDown, Menu, X, Database, Lock, Clock3, Zap, CreditCard, Search, Snowflake, type LucideIcon } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useBilling } from '@/lib/billing';
import { getPlan } from '@/lib/plans';
import { LangPicker } from './ui';
import type { TabId } from '@/lib/types';
type Item = [TabId, string, LucideIcon];
const daily: Item[] = [['overview', 'nav.overview', LayoutDashboard], ['orders', 'nav.orders', ClipboardList], ['products', 'nav.products', Boxes], ['messages', 'nav.messages', MessageCircle]];
const inventory: Item[] = [['action-console', 'nav.actionConsole', Zap], ['master-catalog', 'nav.masterCatalog', Database], ['reservations', 'nav.reservations', Lock], ['sync-ledger', 'activity.title', Clock3]];
export function Sidebar({ tab, setTab, subscribed, user }: { tab: TabId; setTab: (id: TabId) => void; subscribed: boolean; user: { email: string } | null; onSignOut: () => void }) {
  const { lang, setLang, t } = useLang();
  const { plan, remaining } = useBilling();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobileOpen) return;
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    function keyboard(e: KeyboardEvent) {
      if (e.key === 'Escape') { setMobileOpen(false); menuRef.current?.focus(); }
      if (e.key === 'Tab') {
        const items = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button, select, summary') ?? []).filter(el => el.getClientRects().length);
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', keyboard);
    return () => document.removeEventListener('keydown', keyboard);
  }, [mobileOpen]);
  function select(id: TabId) { setTab(id); setMobileOpen(false); if (mobileOpen) menuRef.current?.focus(); }
  function item([id, key, Icon]: Item) {
    return <button key={id} onClick={() => select(id)} aria-current={(tab === id || (id === 'products' && tab === 'automate')) ? 'page' : undefined} className={`nav-item ${(tab === id || (id === 'products' && tab === 'automate')) ? 'nav-item-active' : ''}`}><Icon size={18} strokeWidth={1.7} /><span>{t(key)}</span></button>;
  }
  const content = <>
    <nav aria-label={t('nav.overview')} className="flex-1 overflow-y-auto px-4 space-y-1">
      <div className="mb-4 flex h-9 items-center gap-2 rounded-lg bg-[#f6f8fb] px-3 text-xs text-slate-400">
        <Search size={14} />
        <span>Search</span>
        <span className="ml-auto rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400">/</span>
      </div>
      <div className="nav-section-label">Favorites</div>
      {daily.map(item)}
      <div className="space-y-2">
        <details key={`inventory-${inventory.some(([id]) => id === tab)}`} open={inventory.some(([id]) => id === tab)} className="nav-group"><summary>{t('nav.inventorySync')}<ChevronDown size={15} /></summary><div className="pt-1">{inventory.map(item)}</div></details>
      </div>
    </nav>
    <div className="p-4 space-y-3 border-t border-[#edf0f5]">
      {item(['settings', 'nav.settings', Settings])}
      {item(['subscription', 'billing.manage', CreditCard])}
      <details className="nav-group"><summary><span className="truncate">{user?.email}</span><ChevronDown size={14} /></summary><div className="pt-3 space-y-3"><LangPicker lang={lang} setLang={setLang} /></div></details>
      <div className="rounded-lg bg-[#f6f8fb] px-3 py-3 text-xs text-slate-500">{getPlan(plan).name} · {remaining} {t('billing.remaining')}</div>
    </div>
  </>;
  return <>
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#edf0f5]"><span className="inline-flex items-center gap-2 font-semibold text-lg"><Snowflake size={18} className="text-[#8ba6ff]" />OneNiaga</span><button ref={menuRef} aria-label={t('simple.menu')} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="p-2"><Menu size={22} /></button></div>
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-white border-r border-[#edf0f5]"><div className="px-7 py-8 font-semibold text-xl tracking-tight inline-flex items-center gap-2"><Snowflake size={20} className="text-[#8ba6ff]" />OneNiaga</div>{content}</aside>
    {mobileOpen && <div className="md:hidden fixed inset-0 z-50"><div className="absolute inset-0 bg-slate-900/30" onClick={() => { setMobileOpen(false); menuRef.current?.focus(); }} /><aside ref={drawerRef} role="dialog" aria-modal="true" aria-label={t('simple.menu')} className="absolute inset-y-0 left-0 w-72 max-w-[90vw] bg-white flex flex-col"><div className="flex justify-between items-center p-6"><strong className="inline-flex items-center gap-2"><Snowflake size={18} className="text-[#8ba6ff]" />OneNiaga</strong><button aria-label={t('simple.close')} onClick={() => { setMobileOpen(false); menuRef.current?.focus(); }} className="p-2"><X size={20} /></button></div>{content}</aside></div>}
  </>;
}





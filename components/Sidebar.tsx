'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Boxes,
  ClipboardList,
  CreditCard,
  Database,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Lock,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Terminal,
  Wand2,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useBilling } from '@/lib/billing';
import { getPlan } from '@/lib/plans';
import { LangPicker } from './ui';
import type { TabId } from '@/lib/types';

type NavItem = { id: TabId; key: string; icon: LucideIcon; gated: boolean };

const MAIN_NAV: NavItem[] = [
  { id: 'overview', key: 'nav.overview', icon: LayoutDashboard, gated: false },
  { id: 'orders', key: 'nav.orders', icon: ClipboardList, gated: false },
  { id: 'products', key: 'nav.products', icon: Boxes, gated: false },
  { id: 'automate', key: 'nav.automate', icon: Wand2, gated: true },
  { id: 'analyze', key: 'nav.analyze', icon: LineChartIcon, gated: true },
  { id: 'advise', key: 'nav.advise', icon: Sparkles, gated: true },
  { id: 'messages', key: 'nav.messages', icon: MessageCircle, gated: true },
];

const SYNC_NAV: NavItem[] = [
  { id: 'action-console', key: 'nav.actionConsole', icon: Zap, gated: false },
  { id: 'master-catalog', key: 'nav.masterCatalog', icon: Database, gated: false },
  { id: 'reservations', key: 'nav.reservations', icon: Lock, gated: false },
  { id: 'sync-ledger', key: 'activity.title', icon: Terminal, gated: false },
];

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight ${className}`}>
      OneNiaga<span className="text-[#EE4EA0]">.</span>
    </span>
  );
}

function BrandMark() {
  return (
    <span className="grid justify-center gap-0.5" aria-hidden="true">
      <span className="block h-2.5 w-8 rounded-full bg-gradient-to-r from-[#FB725D] to-[#EE4EA0] rotate-[29deg]" />
      <span className="ml-1 block h-2.5 w-6 rounded-full bg-gradient-to-r from-[#FFE0C9] to-[#FB725D] -rotate-[28deg]" />
    </span>
  );
}

export function Sidebar({
  tab,
  setTab,
  subscribed,
  user,
  onSignOut,
}: {
  tab: TabId;
  setTab: (id: TabId) => void;
  subscribed: boolean;
  user: { email: string } | null;
  onSignOut: () => void;
}) {
  const { lang, setLang, t } = useLang();
  const { plan, used, pending, remaining, resetDate } = useBilling();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const activePlan = getPlan(plan);
  const totalCredits = activePlan.aiCredits ?? 0;
  const creditPercent = totalCredits > 0 ? Math.max(0, Math.min(100, ((totalCredits - remaining) / totalCredits) * 100)) : 0;
  const resetLabel = resetDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short' });

  useEffect(() => {
    if (!mobileOpen) return;
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    function keyboard(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        menuRef.current?.focus();
      }
      if (e.key === 'Tab') {
        const items = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button, select, summary') ?? []).filter((el) => el.getClientRects().length);
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener('keydown', keyboard);
    return () => document.removeEventListener('keydown', keyboard);
  }, [mobileOpen]);

  function selectTab(id: TabId) {
    setTab(id);
    setMobileOpen(false);
    if (mobileOpen) menuRef.current?.focus();
  }

  function renderItem(n: NavItem) {
    const Icon = n.icon;
    const active = tab === n.id || (n.id === 'products' && tab === 'automate');
    return (
      <button
        key={n.id}
        onClick={() => selectTab(n.id)}
        aria-current={active ? 'page' : undefined}
        title={t(n.key)}
        className={`nav-item ${active ? 'nav-item-active' : ''}`}
      >
        <span className="flex items-center gap-3">
          <Icon size={18} strokeWidth={1.7} />
          <span className="nav-label">{t(n.key)}</span>
        </span>
      </button>
    );
  }

  const navContent = (
    <>
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        <div className="sidebar-search mb-4 flex h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-xs text-white/50">
          <Search size={14} />
          <span>Search</span>
          <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/40">/</span>
        </div>

        <div className="nav-section-label">Menu</div>
        {MAIN_NAV.map(renderItem)}

        <div className="inventory-divider" aria-hidden="true" />
        <div className="nav-section-label inventory-label">{t('nav.inventorySync')}</div>
        <div className="space-y-1">{SYNC_NAV.map(renderItem)}</div>

        <div className="inventory-divider account-divider" aria-hidden="true" />
        {renderItem({ id: 'subscription', key: 'nav.subscription', icon: CreditCard, gated: false })}
        {renderItem({ id: 'settings', key: 'nav.settings', icon: SettingsIcon, gated: false })}
      </nav>
      <div className="p-4 space-y-3 border-t border-white/10">
        <div className="sidebar-email truncate px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/45">{user?.email}</div>
        <div className="space-y-3">
          <LangPicker lang={lang} setLang={setLang} dark />
          <button onClick={onSignOut} className="nav-item">{t('settings.signOut')}</button>
        </div>
        <div className="sidebar-plan rounded-2xl bg-white/10 px-3 py-3 text-xs text-white/60">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-white">{activePlan.name}</span>
            <span className="tabular">{remaining}/{totalCredits} credits</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gradient-to-r from-[#FB725D] to-[#EE4EA0]" style={{ width: `${creditPercent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
            <span>{used} used{pending > 0 ? `, ${pending} pending` : ''}</span>
            <span>Resets {resetLabel}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a0e1d] text-white">
        <button ref={menuRef} onClick={() => setMobileOpen(true)} className="p-1 text-white" aria-label={t('simple.menu')} aria-expanded={mobileOpen}>
          <Menu size={22} />
        </button>
        <span className="flex items-center gap-2 font-semibold text-base">
          <BrandMark />
          <Wordmark />
        </span>
        <span style={{ width: 22 }} />
      </div>

      <aside className={`sidebar-shell ${sidebarExpanded ? 'is-expanded w-64' : 'w-24'} hidden md:sticky md:top-0 md:flex md:h-[calc(100vh-52px)] shrink-0 flex-col bg-[#0a0e1d] text-white`}>
        <div className="flex items-center justify-between gap-2 px-5 py-8">
          <div className="flex items-center gap-3">
            <BrandMark />
            <Wordmark className="sidebar-wordmark text-lg" />
          </div>
          <button
            type="button"
            onClick={() => setSidebarExpanded((value) => !value)}
            className="sidebar-expand grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/80"
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarExpanded}
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarExpanded ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
        </div>
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => { setMobileOpen(false); menuRef.current?.focus(); }} />
          <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label={t('simple.menu')} className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] flex flex-col bg-[#0a0e1d] text-white">
            <div className="flex items-center justify-between px-5 pt-6 pb-5 shrink-0">
              <div className="flex items-center gap-3">
                <BrandMark />
                <Wordmark className="text-xl" />
              </div>
              <button onClick={() => { setMobileOpen(false); menuRef.current?.focus(); }} className="text-white/70" aria-label={t('simple.close')}>
                <X size={20} />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

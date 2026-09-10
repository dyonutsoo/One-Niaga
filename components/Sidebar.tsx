'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Database,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Lock,
  Menu,
  MessageCircle,
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
      OneNiaga<span className="text-[#E8552F]">.</span>
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
        className={`nav-item ${active ? 'nav-item-active' : ''}`}
      >
        <span className="flex items-center gap-3">
          <Icon size={18} strokeWidth={1.7} />
          {t(n.key)}
        </span>
      </button>
    );
  }

  const navContent = (
    <>
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        <div className="mb-4 flex h-9 items-center gap-2 rounded-lg bg-[#f6f8fb] px-3 text-xs text-slate-400">
          <Search size={14} />
          <span>Search</span>
          <span className="ml-auto rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400">/</span>
        </div>

        <div className="nav-section-label">Favorites</div>
        {MAIN_NAV.map(renderItem)}

        <details key={`inventory-${SYNC_NAV.some((item) => item.id === tab)}`} open={SYNC_NAV.some((item) => item.id === tab)} className="nav-group">
          <summary>
            {t('nav.inventorySync')}
            <ChevronDown size={15} />
          </summary>
          <div className="space-y-1">{SYNC_NAV.map(renderItem)}</div>
        </details>

        {renderItem({ id: 'subscription', key: 'nav.subscription', icon: CreditCard, gated: false })}
        {renderItem({ id: 'settings', key: 'nav.settings', icon: SettingsIcon, gated: false })}
      </nav>
      <div className="p-4 space-y-3 border-t border-[#edf0f5]">
        <details className="nav-group">
          <summary>
            <span className="truncate">{user?.email}</span>
            <ChevronDown size={14} />
          </summary>
          <div className="pt-3 space-y-3">
            <LangPicker lang={lang} setLang={setLang} />
            <button onClick={onSignOut} className="nav-item">{t('settings.signOut')}</button>
          </div>
        </details>
        <div className="rounded-lg bg-[#f6f8fb] px-3 py-3 text-xs text-slate-500">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-700">{activePlan.name}</span>
            <span className="tabular">{remaining}/{totalCredits} credits</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-[#E8552F]" style={{ width: `${creditPercent}%` }} />
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
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#edf0f5]">
        <button ref={menuRef} onClick={() => setMobileOpen(true)} className="p-1 text-slate-700" aria-label={t('simple.menu')} aria-expanded={mobileOpen}>
          <Menu size={22} />
        </button>
        <span className="flex items-center gap-1.5 font-semibold text-base">
          <Wordmark />
        </span>
        <span style={{ width: 22 }} />
      </div>

      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen w-60 shrink-0 flex-col bg-white border-r border-[#edf0f5]">
        <div className="px-7 py-8">
          <Wordmark className="text-xl" />
        </div>
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => { setMobileOpen(false); menuRef.current?.focus(); }} />
          <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label={t('simple.menu')} className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] flex flex-col bg-white">
            <div className="flex items-center justify-between px-5 pt-6 pb-5 shrink-0">
              <div>
                <Wordmark className="text-xl" />
              </div>
              <button onClick={() => { setMobileOpen(false); menuRef.current?.focus(); }} className="text-slate-500" aria-label={t('simple.close')}>
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

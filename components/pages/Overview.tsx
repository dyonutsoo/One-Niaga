'use client';

import { AlertTriangle, Bell, Bug, MessageCircle, Package, RefreshCw, RotateCcw, UserPlus } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BORDER } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { WEEKLY_SALES } from '@/lib/seed';
import { useLang } from '@/lib/i18n';
import { ContextAssistant } from '../ContextAssistant';
import { MorningPriorityBrief } from '../CompanionBrief';
import { totalReturns } from '@/lib/utils';
import type { CompanionRecommendation, CustomerMessage, Order, PlatformId, Product, TabId } from '@/lib/types';

export function Overview({
  products,
  orders,
  anyLinked,
  linked,
  messages,
  setTab,
  goToWithFocus,
  companionRecommendations,
  completedCompanionIds,
  onApproveCompanion,
  onOpenCompanion,
}: {
  products: Product[];
  orders: Order[];
  anyLinked: boolean;
  linked: Record<PlatformId, boolean>;
  messages: CustomerMessage[];
  setTab: (id: TabId) => void;
  goToWithFocus: (tab: TabId, focus: string | null) => void;
  companionRecommendations: CompanionRecommendation[];
  completedCompanionIds: Set<string>;
  onApproveCompanion: (item: CompanionRecommendation) => void;
  onOpenCompanion: (item: CompanionRecommendation) => void;
}) {
  const { t } = useLang();
  const connected = PLATFORMS.filter((p) => linked[p.id]);
  const sales = WEEKLY_SALES.map((day) => ({
    day: day.day,
    revenue: connected.reduce((sum, p) => sum + Number(day[p.name as keyof typeof day]), 0),
  }));
  const totalRevenue = sales.reduce((s, d) => s + d.revenue, 0);
  const awaiting = orders.filter((o) => o.status === 'awaiting').length;
  const lowStock = products.filter((p) => p.dailySales > 0 && p.stock / p.dailySales < 3);
  const unreplied = messages.filter((m) => !m.replied && linked[m.platform]).length;
  const elevatedReturns = products.filter((p) => totalReturns(p.returns) > 2);
  const attentionItems = [
    { count: awaiting, label: t(awaiting === 1 ? 'overview.itemOrders1' : 'overview.itemOrdersN'), icon: Package, tab: 'orders' as TabId, focus: null },
    { count: lowStock.length, label: t(lowStock.length === 1 ? 'overview.itemStock1' : 'overview.itemStockN'), icon: AlertTriangle, tab: 'products' as TabId, focus: 'lowStock' },
    { count: unreplied, label: t(unreplied === 1 ? 'overview.itemMsg1' : 'overview.itemMsgN'), icon: MessageCircle, tab: 'messages' as TabId, focus: null },
    { count: elevatedReturns.length, label: t(elevatedReturns.length === 1 ? 'overview.itemReturns1' : 'overview.itemReturnsN'), icon: RotateCcw, tab: 'products' as TabId, focus: 'elevatedReturns' },
  ].filter((it) => it.count > 0);
  const channelTraffic = [
    { name: 'Shopee', value: Math.max(8, Math.round(totalRevenue * 0.018)), color: '#8BA6FF' },
    { name: 'TikTok', value: Math.max(8, Math.round(totalRevenue * 0.023)), color: '#A5EBC2' },
    { name: 'Lazada', value: Math.max(8, Math.round(totalRevenue * 0.016)), color: '#17181A' },
    { name: 'Web', value: Math.max(8, Math.round(totalRevenue * 0.012)), color: '#BCA7F7' },
  ];
  const locations = [
    { name: 'Malaysia', value: 52.1, color: '#17181A' },
    { name: 'Singapore', value: 22.8, color: '#BFE9F8' },
    { name: 'Indonesia', value: 13.9, color: '#A5EBC2' },
    { name: 'Other', value: 11.2, color: '#D9DCE5' },
  ];
  const rail = [
    { icon: Bug, title: 'Inventory drift fixed.', time: 'Just now' },
    { icon: UserPlus, title: 'New buyer registered.', time: '59 minutes ago' },
    { icon: Bell, title: 'Low-stock alert queued.', time: '12 hours ago' },
    { icon: RefreshCw, title: 'Catalog sync completed.', time: 'Today, 11:59 AM' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      <header className="sticky top-0 z-10 flex min-h-[57px] items-center justify-between gap-4 border-b border-[#edf0f5] bg-white/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Dashboards</span>
          <span>/</span>
          <strong className="font-semibold text-slate-700">Default</strong>
        </div>
        <span className="text-xs text-slate-500">Demo data</span>
      </header>

      <div className="grid gap-6 p-4 sm:p-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-6">
          <section>
            <h1 className="text-2xl font-semibold tracking-tight">Good morning. Here is what OneNiaga is watching.</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Your AI companion plans ahead from the same products, orders, stock, returns, and customer messages the seller works with every day.
            </p>
          </section>

          {!anyLinked ? (
            <section className="surface p-8 text-sm text-slate-500">{t('overview.noPlatforms')}</section>
          ) : (
            <>
              <MorningPriorityBrief
                recommendations={companionRecommendations}
                completedIds={completedCompanionIds}
                onApprove={onApproveCompanion}
                onOpen={onOpenCompanion}
              />

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: t('overview.statRevenue'), value: `RM ${totalRevenue.toLocaleString()}`, sub: '+11.01%', bg: '#dff4ff' },
                  { label: t('overview.statAwaiting'), value: awaiting, sub: '+0.03%', bg: '#eef2fb' },
                  { label: t('overview.statStock'), value: lowStock.length, sub: '+15.03%', bg: '#dff4ff' },
                  { label: t('nav.messages'), value: unreplied, sub: '-0.68%', bg: '#eef2fb' },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg p-5 shadow-[0_16px_42px_rgba(31,35,40,0.03)]" style={{ background: metric.bg, border: '1px solid rgba(255,255,255,.75)' }}>
                    <p className="text-xs font-semibold text-slate-600">{metric.label}</p>
                    <div className="mt-3 flex items-end gap-3">
                      <p className="text-2xl font-semibold tracking-tight tabular text-[#17181a]">{metric.value}</p>
                      <span className="pb-1 text-[11px] font-medium text-slate-500">{metric.sub}</span>
                    </div>
                  </div>
                ))}
              </section>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
                <section className="surface overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#f3f5f8] p-6">
                    <h2 className="font-semibold">{t('overview.attention')}</h2>
                    <span className="text-xs text-slate-500">{attentionItems.length}</span>
                  </div>
                  {attentionItems.map(({ icon: Icon, ...item }) => (
                    <button key={item.label} className="task-row" onClick={() => goToWithFocus(item.tab, item.focus)}>
                      <span className="rounded-lg bg-slate-50 p-2.5 text-slate-500"><Icon size={18} /></span>
                      <span className="flex-1 text-sm"><strong>{item.count}</strong> {item.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-[#f3f5f8] p-4">
                    <ContextAssistant mode="priorities" products={products} orders={orders} platforms={connected.map((p) => p.id)} onNavigate={setTab} />
                  </div>
                </section>

                <section className="surface min-w-0 p-6">
                  <h2 className="font-semibold">{t('overview.chartMix')}</h2>
                  <p className="mb-6 mt-1 text-xs text-slate-500">{t('overview.desc')}</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={sales} margin={{ left: -20, right: 8, top: 10 }}>
                      <CartesianGrid vertical={false} stroke="#f1f3f5" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8d95a3' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8d95a3' }} />
                      <Tooltip formatter={(value: number) => [`RM ${value.toLocaleString()}`, t('overview.statRevenue')]} contentStyle={{ borderRadius: 8, border: `1px solid ${BORDER}` }} />
                      <Bar dataKey="revenue" fill="#17181A" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="surface p-6 min-w-0">
                  <h2 className="font-semibold">Traffic by Channel</h2>
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={channelTraffic} margin={{ left: -24, right: 4, top: 18 }}>
                      <CartesianGrid vertical={false} stroke="#f1f3f5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8d95a3' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8d95a3' }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${BORDER}` }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>{channelTraffic.map((item) => <Cell key={item.name} fill={item.color} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </section>
                <section className="surface p-6 min-w-0">
                  <h2 className="font-semibold">Traffic by Location</h2>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart><Pie data={locations} dataKey="value" innerRadius={43} outerRadius={66} paddingAngle={2} isAnimationActive={false}>{locations.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">{locations.map((item) => <div key={item.name} className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} /><span className="flex-1">{item.name}</span><strong className="font-medium text-slate-700">{item.value}%</strong></div>)}</div>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>

        <aside className="hidden space-y-7 border-l border-[#edf0f5] pl-6 lg:block">
          <section>
            <h2 className="mb-4 text-sm font-semibold">Notifications</h2>
            <div className="space-y-4">{rail.slice(0, 3).map(({ icon: Icon, title, time }) => <div key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f6f8fb] text-slate-600"><Icon size={14} /></span><div><p className="text-xs font-medium text-slate-700">{title}</p><p className="mt-0.5 text-[11px] text-slate-400">{time}</p></div></div>)}</div>
          </section>
          <section>
            <h2 className="mb-4 text-sm font-semibold">Activities</h2>
            <div className="space-y-4">{rail.slice(1).map(({ icon: Icon, title, time }) => <div key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-slate-600"><Icon size={14} /></span><div><p className="text-xs font-medium text-slate-700">{title}</p><p className="mt-0.5 text-[11px] text-slate-400">{time}</p></div></div>)}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}

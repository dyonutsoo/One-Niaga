'use client';

import { AlertTriangle, Bell, Bug, MessageCircle, Package, RefreshCw, RotateCcw, UserPlus } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
    { name: 'Shopee', value: Math.max(8, Math.round(totalRevenue * 0.018)), color: '#FB725D' },
    { name: 'TikTok', value: Math.max(8, Math.round(totalRevenue * 0.023)), color: '#EE4EA0' },
    { name: 'Lazada', value: Math.max(8, Math.round(totalRevenue * 0.016)), color: '#0A0E1D' },
    { name: 'Web', value: Math.max(8, Math.round(totalRevenue * 0.012)), color: '#F5C738' },
  ];
  const locations = [
    { name: 'Malaysia', value: 52.1, color: '#0A0E1D' },
    { name: 'Singapore', value: 22.8, color: '#FB725D' },
    { name: 'Indonesia', value: 13.9, color: '#EE4EA0' },
    { name: 'Other', value: 11.2, color: '#E1DDD5' },
  ];
  const rail = [
    { icon: Bug, title: 'Inventory drift fixed.', time: 'Just now' },
    { icon: UserPlus, title: 'New buyer registered.', time: '59 minutes ago' },
    { icon: Bell, title: 'Low-stock alert queued.', time: '12 hours ago' },
    { icon: RefreshCw, title: 'Catalog sync completed.', time: 'Today, 11:59 AM' },
  ];
  const heroSegments = [
    { label: 'Shopee', value: connected.some((p) => p.id === 'shopee') ? 42 : 0 },
    { label: 'TikTok', value: connected.some((p) => p.id === 'tiktok') ? 35 : 0 },
    { label: 'Direct', value: Math.max(0, 100 - (connected.length ? 77 : 0)) },
  ];
  const completion = Math.min(100, Math.round(((orders.length - awaiting) / Math.max(orders.length, 1)) * 100));

  return (
    <div className="mx-auto max-w-[1440px]">
      <header className="sticky top-0 z-10 flex min-h-[78px] flex-wrap items-center justify-between gap-4 bg-[#f3f1ed]/90 px-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#090b18]">Analytics</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#85847e]">
            <span>Dashboards</span>
            <span>/</span>
            <strong className="font-semibold text-[#090b18]">Default workspace</strong>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/60 px-4 text-xs font-medium text-[#090b18]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#3d5fae] text-[11px] text-white">f</span>
            facebook.com/oneniaga
          </span>
          <button type="button" className="primary-button" onClick={() => setTab('products')}>
            New Campaign
          </button>
          <span className="text-xs text-[#85847e]">Demo data</span>
        </div>
      </header>

      <div className="grid gap-7 px-4 pb-8 pt-2 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-7">
          {!anyLinked ? (
            <section className="surface p-8 text-sm text-slate-500">{t('overview.noPlatforms')}</section>
          ) : (
            <>
              <div className="grid gap-7 xl:grid-cols-[1.04fr_1fr]">
                <section className="gradient-card rounded-[28px] p-7">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-white/90">{t('overview.statRevenue')}</p>
                    <span className="text-white/80">•••</span>
                  </div>
                  <p className="mt-3 text-4xl font-semibold tracking-tight tabular">RM {totalRevenue.toLocaleString()}</p>
                  <div className="mt-5 h-14">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sales}>
                        <Line type="monotone" dataKey="revenue" stroke="rgba(255,255,255,.78)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="revenue" stroke="rgba(10,14,29,.38)" strokeWidth={1.4} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-5">
                    {heroSegments.map((segment) => (
                      <div key={segment.label} className="border-r border-white/30 last:border-r-0">
                        <p className="text-xs text-white/70">{segment.label}</p>
                        <p className="mt-2 text-xl font-semibold tabular">{segment.value}%</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="surface grid gap-4 p-7 sm:grid-cols-[minmax(0,.8fr)_150px]">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-[#090b18]">{t('overview.attention')}</p>
                      <span className="text-[#85847e]">•••</span>
                    </div>
                    <p className="mt-3 text-4xl font-semibold tracking-tight tabular text-[#090b18]">{attentionItems.length || 0}.k</p>
                    <div className="mt-7 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[#85847e]">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#fb725d]" />
                        <span>Urgent</span>
                        <strong className="ml-auto text-[#090b18]">{lowStock.length + awaiting}</strong>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#85847e]">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#f5c738]" />
                        <span>Watch</span>
                        <strong className="ml-auto text-[#090b18]">{unreplied + elevatedReturns.length}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="relative mx-auto aspect-square w-36 rounded-full bg-[conic-gradient(#0a0e1d_0_24%,transparent_24%_29%,#fb725d_29%_59%,transparent_59%_64%,#f5c738_64%_75%,transparent_75%_80%,#ee4ea0_80%_100%)] before:absolute before:inset-[22px] before:rounded-full before:bg-[#f3f1ed] after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-[35deg] after:rounded-xl after:bg-gradient-to-br after:from-[#f88972] after:to-[#b9342e] after:shadow-[0_14px_22px_rgba(171,52,46,.24)]" aria-label="Attention split chart" />
                </section>
              </div>

              <MorningPriorityBrief
                recommendations={companionRecommendations}
                completedIds={completedCompanionIds}
                onApprove={onApproveCompanion}
                onOpen={onOpenCompanion}
              />

              <div className="grid gap-7 xl:grid-cols-[1.15fr_1fr]">
                <section className="surface overflow-hidden">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-7">
                      <h2 className="font-semibold text-[#090b18]">Post Activity</h2>
                      <span className="text-sm text-[#85847e]">User</span>
                    </div>
                    <span className="text-xs text-[#85847e]">{attentionItems.length} active</span>
                  </div>
                  <div className="px-3 pb-4">
                    {attentionItems.map(({ icon: Icon, ...item }) => (
                      <button key={item.label} className="task-row rounded-2xl" onClick={() => goToWithFocus(item.tab, item.focus)}>
                        <span className="rounded-xl bg-white/70 p-2.5 text-[#0a0e1d]"><Icon size={18} /></span>
                        <span className="flex-1 text-left text-sm text-[#090b18]"><strong>{item.count}</strong> {item.label}</span>
                        <span className="hidden rounded-full bg-[#0a0e1d] px-2.5 py-1 text-xs text-white sm:inline-flex">Open</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-black/5 p-4">
                    <ContextAssistant mode="priorities" products={products} orders={orders} platforms={connected.map((p) => p.id)} onNavigate={setTab} />
                  </div>
                </section>

                <section className="surface min-w-0 p-6">
                  <h2 className="font-semibold text-[#090b18]">{t('overview.chartMix')}</h2>
                  <p className="mb-6 mt-1 text-xs text-[#85847e]">{t('overview.desc')}</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={sales} margin={{ left: -20, right: 8, top: 10 }}>
                      <CartesianGrid vertical={false} stroke="rgba(10,14,29,.08)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#85847e' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#85847e' }} />
                      <Tooltip formatter={(value: number) => [`RM ${value.toLocaleString()}`, t('overview.statRevenue')]} contentStyle={{ borderRadius: 18, border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,.94)' }} />
                      <Bar dataKey="revenue" fill="#0a0e1d" radius={[9, 9, 9, 9]} />
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              </div>

              <div className="grid gap-7 xl:grid-cols-2">
                <section className="surface p-6 min-w-0">
                  <div>
                    <h2 className="font-semibold text-[#090b18]">Traffic by Channel</h2>
                    <p className="mt-1 text-xs text-[#85847e]">Reach by connected storefront</p>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={channelTraffic} margin={{ left: -24, right: 4, top: 18 }}>
                      <CartesianGrid vertical={false} stroke="rgba(10,14,29,.08)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#85847e' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#85847e' }} />
                      <Tooltip contentStyle={{ borderRadius: 18, border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,.94)' }} />
                      <Bar dataKey="value" radius={[9, 9, 9, 9]}>{channelTraffic.map((item) => <Cell key={item.name} fill={item.color} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </section>
                <section className="surface p-6 min-w-0">
                  <div>
                    <h2 className="font-semibold text-[#090b18]">Traffic by Location</h2>
                    <p className="mt-1 text-xs text-[#85847e]">Audience split by market</p>
                  </div>
                  <div className="mt-3 grid grid-cols-[140px_1fr] items-center gap-3 max-sm:grid-cols-1">
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart><Pie data={locations} dataKey="value" innerRadius={43} outerRadius={66} paddingAngle={2} isAnimationActive={false}>{locations.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">{locations.map((item) => <div key={item.name} className="flex items-center gap-2 text-xs text-[#85847e]"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} /><span className="flex-1">{item.name}</span><strong className="font-medium text-[#090b18]">{item.value}%</strong></div>)}</div>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>

        <aside className="hidden space-y-7 lg:block">
          <section className="surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#090b18]">Weekly Revenue</h2>
                <p className="mt-1 text-xs text-[#85847e]">7-day sales across connected channels</p>
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#090b18]">RM</span>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={sales} margin={{ left: -24, right: 4, top: 18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(10,14,29,.06)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#85847e' }} />
                <YAxis hide />
                <Tooltip formatter={(value: number) => [`RM ${value.toLocaleString()}`, t('overview.statRevenue')]} contentStyle={{ borderRadius: 18, border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,.94)' }} />
                <Bar dataKey="revenue" radius={[9, 9, 9, 9]}>
                  {sales.map((item, index) => <Cell key={item.day} fill={index === 3 ? '#EE4EA0' : index === 0 ? '#FB725D' : 'rgba(10,14,29,.16)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-[48px_1fr_auto] items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffd7d9] text-[#090b18]"><Package size={17} /></span>
              <div>
                <p className="text-sm font-medium text-[#090b18]">Completed Orders</p>
                <p className="text-xs text-[#85847e]">Current week</p>
              </div>
              <strong className="tabular text-[#090b18]">{completion}%</strong>
            </div>
          </section>

          <section className="surface grid grid-cols-[82px_1fr] items-center gap-4 p-3">
            <div className="metric-badge grid min-h-[76px] place-items-center rounded-3xl text-center text-xl font-semibold tabular">
              {lowStock.length}.k
              <AlertTriangle size={15} />
            </div>
            <div>
              <h2 className="font-semibold text-[#090b18]">Stock Watch</h2>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-[#0a0e1d]" style={{ width: `${Math.min(100, lowStock.length * 18)}%` }} />
              </div>
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#090b18]">Activities</h2>
            <div className="space-y-4">{rail.slice(1).map(({ icon: Icon, title, time }) => <div key={title} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#090b18]"><Icon size={14} /></span><div><p className="text-xs font-medium text-[#090b18]">{title}</p><p className="mt-0.5 text-[11px] text-[#85847e]">{time}</p></div></div>)}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}

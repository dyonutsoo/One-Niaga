'use client';
import { ArrowRight, CheckCircle2, Package, AlertTriangle, MessageCircle, RotateCcw, Bell, UserPlus, Bug, RefreshCw } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PLATFORMS } from '@/lib/platforms';
import { WEEKLY_SALES } from '@/lib/seed';
import { useLang } from '@/lib/i18n';
import { ContextAssistant } from '../ContextAssistant';
import { totalReturns } from '@/lib/utils';
import type { CustomerMessage, Order, PlatformId, Product, TabId } from '@/lib/types';
export function Overview({ products, orders, anyLinked, linked, messages, setTab, goToWithFocus }: { products: Product[]; orders: Order[]; anyLinked: boolean; linked: Record<PlatformId, boolean>; messages: CustomerMessage[]; setTab: (id: TabId) => void; goToWithFocus: (tab: TabId, focus: string | null) => void }) {
  const { t } = useLang();
  const connected = PLATFORMS.filter(p => linked[p.id]);
  const sales = WEEKLY_SALES.map(day => ({ day: day.day, revenue: connected.reduce((sum, p) => sum + Number(day[p.name as keyof typeof day]), 0) }));
  const revenue = sales.reduce((sum, day) => sum + day.revenue, 0);
  const awaiting = orders.filter(o => o.status === 'awaiting').length;
  const low = products.filter(p => p.dailySales > 0 && p.stock / p.dailySales < 3).length;
  const unread = messages.filter(m => !m.replied && linked[m.platform]).length;
  const returns = products.filter(p => totalReturns(p.returns) > 2).length;
  const deviceTraffic = [
    { name: 'Shopee', value: Math.max(8, Math.round(revenue * 0.018)), color: '#8BA6FF' },
    { name: 'TikTok', value: Math.max(8, Math.round(revenue * 0.023)), color: '#A5EBC2' },
    { name: 'Lazada', value: Math.max(8, Math.round(revenue * 0.016)), color: '#17181A' },
    { name: 'Web', value: Math.max(8, Math.round(revenue * 0.012)), color: '#BCA7F7' },
  ];
  const locationTraffic = [
    { name: 'Malaysia', value: 52.1, color: '#17181A' },
    { name: 'Singapore', value: 22.8, color: '#BFE9F8' },
    { name: 'Indonesia', value: 13.9, color: '#A5EBC2' },
    { name: 'Other', value: 11.2, color: '#D9DCE5' },
  ];
  const notifications = [
    { icon: Bug, title: 'Inventory drift fixed.', time: 'Just now' },
    { icon: UserPlus, title: 'New buyer registered.', time: '59 minutes ago' },
    { icon: Bell, title: 'Low-stock alert queued.', time: '12 hours ago' },
  ];
  const activities = [
    { icon: RefreshCw, title: 'Catalog sync completed.', time: 'Today, 11:59 AM' },
    { icon: Package, title: 'Bundle campaign updated.', time: 'Feb 2, 2026' },
    { icon: MessageCircle, title: 'Unread message tagged.', time: 'Yesterday' },
  ];
  const tasks = [
    { count: awaiting, label: t(awaiting === 1 ? 'overview.itemOrders1' : 'overview.itemOrdersN'), icon: Package, tab: 'orders' as TabId, focus: null },
    { count: low, label: t(low === 1 ? 'overview.itemStock1' : 'overview.itemStockN'), icon: AlertTriangle, tab: 'products' as TabId, focus: 'lowStock' },
    { count: unread, label: t(unread === 1 ? 'overview.itemMsg1' : 'overview.itemMsgN'), icon: MessageCircle, tab: 'messages' as TabId, focus: null },
    { count: returns, label: t(returns === 1 ? 'overview.itemReturns1' : 'overview.itemReturnsN'), icon: RotateCcw, tab: 'products' as TabId, focus: 'elevatedReturns' },
  ].filter(task => task.count > 0);
  return <div className="max-w-[1440px] mx-auto">
    <header className="sticky top-0 z-10 flex min-h-[57px] items-center justify-between gap-4 border-b border-[#edf0f5] bg-white/92 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboards</span>
        <span>/</span>
        <strong className="font-semibold text-slate-700">Default</strong>
      </div>
      <span className="text-xs text-slate-500">{t('simple.demo')}</span>
    </header>
    <div className="grid gap-6 p-4 sm:p-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:p-8">
    <div className="min-w-0 space-y-6">
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-semibold tracking-tight">{t('simple.today')}</h1><p className="text-sm text-slate-500 mt-2">{t('simple.todayDesc')}</p></div>
    </section>
    {!anyLinked ? <section className="surface p-8"><h2 className="font-semibold">{t('connect.title')}</h2><p className="text-sm text-slate-500 my-3">{t('overview.noPlatforms')}</p><button className="primary-button" onClick={() => setTab('settings')}>{t('connect.connect')}<ArrowRight size={16} /></button></section> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t('nav.overview')}>
        {[
          { label: t('simple.revenue'), value: `RM ${revenue.toLocaleString()}`, sub: '+11.01%', bg: '#dff4ff' },
          { label: t('overview.statAwaiting'), value: awaiting, sub: '+0.03%', bg: '#eef2fb' },
          { label: t('simple.activeProducts'), value: products.length, sub: '+15.03%', bg: '#dff4ff' },
          { label: t('nav.messages'), value: unread, sub: '-0.68%', bg: '#eef2fb' },
        ].map(metric => <div key={metric.label} className="rounded-lg p-5 shadow-[0_16px_42px_rgba(31,35,40,0.03)]" style={{ background: metric.bg, border: '1px solid rgba(255,255,255,.75)' }}><p className="text-xs font-semibold text-slate-600">{metric.label}</p><div className="mt-3 flex items-end gap-3"><p className="text-2xl font-semibold tracking-tight tabular text-[#17181a]">{metric.value}</p><span className="pb-1 text-[11px] font-medium text-slate-500">{metric.sub}</span></div></div>)}
      </section>
      <div className="grid xl:grid-cols-[1.2fr_1fr] gap-6">
        <section className="surface overflow-hidden"><div className="p-6 border-b border-slate-100 flex items-center justify-between"><h2 className="font-semibold">{t('simple.attention')}</h2><span className="text-xs text-slate-500">{tasks.length}</span></div>{tasks.length ? tasks.map(({ icon: Icon, ...task }) => <button key={task.label} className="task-row" onClick={() => goToWithFocus(task.tab, task.focus)}><span className="rounded-lg bg-slate-50 p-2.5 text-slate-500"><Icon size={18} /></span><span className="flex-1 text-sm"><strong className="font-semibold">{task.count}</strong> {task.label}</span><ArrowRight size={16} className="text-slate-400 shrink-0" /></button>) : <div className="p-8 text-sm text-slate-500 flex gap-3"><CheckCircle2 size={20} className="text-emerald-600" />{t('overview.caughtUp')}</div>}<div className="p-4 border-t border-slate-100"><ContextAssistant mode="priorities" products={products} orders={orders} platforms={connected.map(p => p.id)} onNavigate={setTab} /></div></section>
        <section className="surface p-6 min-w-0"><h2 className="font-semibold">{t('simple.sales')}</h2><p className="text-xs text-slate-500 mt-1 mb-6">{t('simple.connectedSales')}</p><ResponsiveContainer width="100%" height={215}><AreaChart data={sales} margin={{ left: -20, right: 8 }}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8BA6FF" stopOpacity={0.2} /><stop offset="100%" stopColor="#8BA6FF" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#f1f3f5" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8d95a3' }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8d95a3' }} /><Tooltip formatter={(value: number) => [`RM ${value.toLocaleString()}`, t('simple.revenue')]} contentStyle={{ borderRadius: 8, border: '1px solid #edf0f5', boxShadow: '0 12px 32px rgba(31,35,40,.08)' }} /><Area type="monotone" dataKey="revenue" stroke="#17181A" strokeWidth={2} fill="url(#salesFill)" isAnimationActive={false} /></AreaChart></ResponsiveContainer><div className="mt-5"><ContextAssistant mode="sales" platforms={connected.map(p => p.id)} onNavigate={setTab} /></div></section>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface p-6 min-w-0"><h2 className="font-semibold">Traffic by Channel</h2><ResponsiveContainer width="100%" height={190}><BarChart data={deviceTraffic} margin={{ left: -24, right: 4, top: 18 }}><CartesianGrid vertical={false} stroke="#f1f3f5" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8d95a3' }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8d95a3' }} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #edf0f5' }} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{deviceTraffic.map(item => <Cell key={item.name} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer></section>
        <section className="surface p-6 min-w-0"><h2 className="font-semibold">Traffic by Location</h2><div className="grid grid-cols-[140px_1fr] items-center gap-3"><ResponsiveContainer width="100%" height={170}><PieChart><Pie data={locationTraffic} dataKey="value" innerRadius={43} outerRadius={66} paddingAngle={2} isAnimationActive={false}>{locationTraffic.map(item => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><div className="space-y-3">{locationTraffic.map(item => <div key={item.name} className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} /><span className="flex-1">{item.name}</span><strong className="font-medium text-slate-700">{item.value}%</strong></div>)}</div></div></section>
      </div>
    </>}
    <section className="flex flex-wrap items-center justify-between gap-4 text-sm"><div className="flex flex-wrap gap-x-5 gap-y-2 text-slate-500">{connected.map(p => <span key={p.id} className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />{p.name}</span>)}</div><button className="text-slate-600 inline-flex items-center gap-2 py-2 hover:text-slate-900" onClick={() => setTab('settings')}>{t('simple.manageStores')}<ArrowRight size={14} /></button></section>
    </div>
    <aside className="hidden space-y-7 border-l border-[#edf0f5] pl-6 lg:block">
      <section><h2 className="mb-4 text-sm font-semibold">Notifications</h2><div className="space-y-4">{notifications.map(({ icon: Icon, title, time }) => <div key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f6f8fb] text-slate-600"><Icon size={14} /></span><div><p className="text-xs font-medium text-slate-700">{title}</p><p className="mt-0.5 text-[11px] text-slate-400">{time}</p></div></div>)}</div></section>
      <section><h2 className="mb-4 text-sm font-semibold">Activities</h2><div className="space-y-4">{activities.map(({ icon: Icon, title, time }) => <div key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-slate-600"><Icon size={14} /></span><div><p className="text-xs font-medium text-slate-700">{title}</p><p className="mt-0.5 text-[11px] text-slate-400">{time}</p></div></div>)}</div></section>
    </aside>
    </div>
  </div>;
}


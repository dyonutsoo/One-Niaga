'use client';

import { useEffect, useRef, useState } from 'react';
import { LanguageContext, makeT } from '@/lib/i18n';
import { SEED_MESSAGES, SEED_ORDERS, SEED_PRODUCTS, seedHolds, seedLedger, seedPurchaseOrders } from '@/lib/seed';
import { PLATFORM_IDS } from '@/lib/platforms';
import { nextId } from '@/lib/utils';
import { SignIn, ConnectPlatforms } from './SignIn';
import { Sidebar } from './Sidebar';
import { Overview } from './pages/Overview';
import { OrdersPage } from './pages/Orders';
import { ProductsPage } from './pages/Products';
import { Automate } from './pages/Automate';


import { MessagesPage } from './pages/Messages';
import { SubscriptionPage } from './pages/Subscription';
import { SettingsPage } from './pages/Settings';
import { ActionConsole } from './inventory/ActionConsole';
import { MasterCatalog } from './inventory/MasterCatalog';
import { ReservationEngine } from './inventory/ReservationEngine';
import { SyncLedger } from './inventory/SyncLedger';
import { ImpactBanner } from './inventory/ImpactBanner';
import { ToastStack } from './ui';
import { BillingProvider, useBilling } from '@/lib/billing';
import { AssistantProvider } from './ContextAssistant';
import { AiAllowance } from './AiAllowance';
import { getPlan } from '@/lib/plans';
import type {
  ChannelMapping,
  CustomerMessage,
  EventType,
  Hold,
  LedgerEvent,
  Order,

  PlatformId,
  Product,
  PurchaseOrder,
  TabId,
  Toast,
  UiLang,
} from '@/lib/types';

const SYNC_TABS: TabId[] = ['action-console', 'master-catalog', 'reservations', 'sync-ledger'];

function initialLinked(): Record<PlatformId, boolean> {
  return PLATFORM_IDS.reduce((acc, id) => ({ ...acc, [id]: false }), {} as Record<PlatformId, boolean>);
}

export default function App() {
  return <BillingProvider><Workspace /></BillingProvider>;
}

function Workspace() {
  const { plan, activate } = useBilling();
  const subscribed = plan !== 'free';
  const planRef = useRef(plan);
  planRef.current = plan;
  // ---- auth / onboarding ----
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [linked, setLinked] = useState<Record<PlatformId, boolean>>(initialLinked);
  const [onboarded, setOnboarded] = useState(false);


  const [uiLang, setUiLang] = useState<UiLang>('en');
  const t = makeT(uiLang);

  // ---- app data ----
  const [tab, setTab] = useState<TabId>('overview');
  const [productsFocus, setProductsFocus] = useState<'lowStock' | 'elevatedReturns' | null>(null);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [messages, setMessages] = useState<CustomerMessage[]>(SEED_MESSAGES);
  const [orders] = useState<Order[]>(SEED_ORDERS);

  // ---- inventory-sync engine ----
  const [now, setNow] = useState(() => Date.now());
  const [holds, setHolds] = useState<Hold[]>(() => seedHolds());
  const [ledger, setLedger] = useState<LedgerEvent[]>(() => seedLedger());
  const [pos, setPOs] = useState<PurchaseOrder[]>(() => seedPurchaseOrders());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [resyncing, setResyncing] = useState(false);
  const [liveFeed, setLiveFeed] = useState(false);
  const [reconcileHours, setReconcileHours] = useState(5.4);
  const [overselPrevented, setOverselPrevented] = useState(0);
  const [capitalProtected, setCapitalProtected] = useState(3420);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setHolds((prev) =>
      prev.map((h): Hold => {
        if (h.status !== 'Active' && h.status !== 'Expiring') return h;
        const remaining = h.expiresAt - now;
        if (remaining <= 0) return { ...h, status: 'Expired' };
        if (remaining < 5 * 60 * 1000) return { ...h, status: 'Expiring' };
        return h;
      })
    );
  }, [now]);

  function pushToast(toast: Omit<Toast, 'id'>) {
    const full: Toast = { ...toast, id: nextId('TOAST') };
    setToasts((prev) => [...prev, full]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== full.id)), 5200);
  }
  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }

  function logEvent(type: EventType, channel: PlatformId | 'SYSTEM', message: string, latencyMs?: number) {
    const evt: LedgerEvent = {
      id: nextId('EVT'),
      ts: Date.now(),
      type,
      channel,
      latencyMs: latencyMs ?? Math.round(80 + Math.random() * 340),
      message,
    };
    setLedger((prev) => [...prev.slice(-149), evt]);
  }

  useEffect(() => {
    if (!liveFeed) return;
    const timer = setInterval(() => {
      const pool = products.filter((p) => Object.values(p.channels).some((c) => c.externalId));
      if (pool.length === 0) return;
      const product = pool[Math.floor(Math.random() * pool.length)];
      const channelIds = PLATFORM_IDS.filter((id) => product.channels[id].externalId);
      const channel = channelIds[Math.floor(Math.random() * channelIds.length)] ?? 'shopee';
      const qty = 1 + Math.floor(Math.random() * 3);
      logEvent('INBOUND', channel, `order.created — ${product.channels[channel].externalId} x${qty} received`, Math.round(90 + Math.random() * 200));
      setTimeout(() => {
        logEvent('CALC', 'SYSTEM', `Master stock recalculated for ${product.name}`, Math.round(10 + Math.random() * 30));
      }, 500);
    }, 7000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveFeed]);

  // ============================ Inventory-sync actions ============================

  function handleDraftPO() {
    const item = products.find((p) => p.sku === 'OH-001');
    if (!item) return;
    const po: PurchaseOrder = {
      id: nextId('PO'),
      sku: item.sku,
      itemName: item.name,
      units: 150,
      status: 'Sent to Supplier',
      createdAt: Date.now(),
      etaDays: 4,
    };
    setPOs((prev) => [...prev, po]);
    logEvent('OUTBOUND', 'SYSTEM', `${po.id} drafted — 150 units of ${item.name} sent to supplier portal`, 118);
    logEvent('CALC', 'SYSTEM', 'Projected stockout window extended past lead time (+4 days coverage)', 24);
    pushToast({
      tone: 'success',
      title: `${po.id} drafted`,
      description: `150 units of ${item.name} sent to your supplier. ETA 4 days — stockout risk cleared.`,
    });
    setReconcileHours((h) => +(h + 0.3).toFixed(1));
  }

  function handleReallocate() {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku !== 'RLT-004') return p;
        const channels: Record<PlatformId, ChannelMapping> = {
          ...p.channels,
          lazada: { ...p.channels.lazada, stock: p.channels.lazada.stock - 25, lastSyncedAt: Date.now() },
          tiktok: { ...p.channels.tiktok, stock: p.channels.tiktok.stock + 25, lastSyncedAt: Date.now() },
        };
        return { ...p, channels };
      })
    );
    logEvent('CALC', 'SYSTEM', 'Reallocation plan computed — 25 units RLT-004 Lazada → TikTok', 19);
    logEvent('OUTBOUND', 'lazada', 'stock.update pushed — LZ-SKU-33871 set to 20', 214);
    logEvent('OUTBOUND', 'tiktok', 'stock.update pushed — TT-PID-77820 set to 25', 187);
    pushToast({
      tone: 'success',
      title: 'Reallocated 25 units to TikTok',
      description: 'Rose Lip Tint is now sellable on TikTok Shop. Lazada retains 20 units of dormant stock.',
    });
    setOverselPrevented((n) => n + 1);
    setReconcileHours((h) => +(h + 0.2).toFixed(1));
  }

  function handleLiquidate() {
    logEvent('OUTBOUND', 'shopee', 'campaign.create pushed — 15% Hero Bundle live on SP-220981', 261);
    logEvent('CALC', 'SYSTEM', 'Deadstock capital reallocation projected: RM 3,060 → active turnover', 22);
    pushToast({
      tone: 'success',
      title: 'Hero Bundle live on Shopee',
      description: 'Canvas Tote Bag now carries a 15% bundle discount to accelerate turnover on 68 idle units.',
    });
    setCapitalProtected((c) => c + 3060);
  }

  function handleResyncAll() {
    if (resyncing) return;
    setResyncing(true);
    logEvent('CALC', 'SYSTEM', 'Full catalog re-sync initiated across all channels', 14);
    setTimeout(() => {
      const ts = Date.now();
      setProducts((prev) =>
        prev.map((p) => {
          const channels: Record<PlatformId, ChannelMapping> = {
            shopee: { ...p.channels.shopee, synced: true, lastSyncedAt: ts },
            lazada: { ...p.channels.lazada, synced: true, lastSyncedAt: ts },
            tiktok: { ...p.channels.tiktok, synced: true, lastSyncedAt: ts },
            webstore: { ...p.channels.webstore, synced: true, lastSyncedAt: ts },
          };
          return { ...p, channels };
        })
      );
      logEvent('OUTBOUND', 'shopee', `Full stock snapshot pushed — ${products.length} SKUs confirmed`, 198);
      logEvent('OUTBOUND', 'tiktok', `Full stock snapshot pushed — ${products.length} SKUs confirmed`, 231);
      logEvent('OUTBOUND', 'lazada', `Full stock snapshot pushed — ${products.length} SKUs confirmed`, 176);
      setResyncing(false);
      pushToast({
        tone: 'info',
        title: 'All channels re-synced',
        description: 'Shopee, TikTok Shop, Lazada, and your Webstore now reflect the master catalog with zero drift.',
      });
      setReconcileHours((h) => +(h + 0.1).toFixed(1));
    }, 1500);
  }

  function handleSimulateLiveDrop() {
    const hold: Hold = {
      id: nextId('HOLD'),
      channel: 'tiktok',
      sku: 'OH-001',
      itemName: 'Oversized Hoodie — Charcoal',
      units: 15,
      createdAt: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000,
      status: 'Active',
      reason: 'TikTok Live Drop hold',
    };
    setHolds((prev) => [...prev, hold]);
    logEvent('INBOUND', 'tiktok', 'webhook.live_drop — hold requested, 15 units OH-001', 143);
    logEvent('CALC', 'SYSTEM', `${hold.id} created — 15 units locked from public pool for 2h`, 16);
    pushToast({
      tone: 'info',
      title: '+15 Units Locked via TikTok Live Drop',
      description: 'A 2-hour reservation buffer now protects live-stream buyers from overselling into the public pool.',
    });
  }

  function handleForceRelease() {
    const expired = holds.filter((h) => h.status === 'Expired');
    if (expired.length === 0) return;
    setHolds((prev) => prev.map((h): Hold => (h.status === 'Expired' ? { ...h, status: 'Released' } : h)));
    expired.forEach((h) => {
      logEvent('OUTBOUND', h.channel, `hold.release — ${h.units} units of ${h.sku} returned to public pool (${h.id})`, Math.round(90 + Math.random() * 150));
    });
    const totalUnits = expired.reduce((s, h) => s + h.units, 0);
    pushToast({
      tone: 'warning',
      title: `${expired.length} unpaid lock${expired.length > 1 ? 's' : ''} released`,
      description: `${totalUnits} units returned to the public channel pool automatically.`,
    });
    setOverselPrevented((n) => n + expired.length);
  }

  function handleInsertWebhook() {
    const pool = products.filter((p) => Object.values(p.channels).some((c) => c.externalId));
    if (pool.length === 0) return;
    const product = pool[Math.floor(Math.random() * pool.length)];
    const channelIds = PLATFORM_IDS.filter((id) => product.channels[id].externalId);
    const channel = channelIds[Math.floor(Math.random() * channelIds.length)] ?? 'shopee';
    const qty = 1 + Math.floor(Math.random() * 4);
    const externalId = product.channels[channel].externalId;
    logEvent('INBOUND', channel, `order.created — ${externalId} x${qty} received (manual trigger)`, Math.round(60 + Math.random() * 150));
    setTimeout(() => logEvent('CALC', 'SYSTEM', `Master stock recalculated for ${product.name}`, Math.round(8 + Math.random() * 20)), 350);
    setTimeout(() => logEvent('OUTBOUND', channel, `stock.update pushed — ${externalId} confirmed`, Math.round(120 + Math.random() * 200)), 700);
  }

  // ============================ App-level handlers ============================

  function updateLinked(updater: (prev: Record<PlatformId, boolean>) => Record<PlatformId, boolean>) {
    setLinked(prev => {
      const next = updater(prev);
      const count = Object.values(next).filter(Boolean).length;
      return count <= getPlan(planRef.current).storeLimit || count < Object.values(prev).filter(Boolean).length ? next : prev;
    });
  }

  function handleSignIn(email: string) {
    activate(email);
    setLinked(initialLinked());
    setUser({ email });
    setAuthed(true);
  }
  function handleSignOut() {
    setAuthed(false);
    setUser(null);
    setOnboarded(false);
    setTab('overview');
  }
  function goAutomateFor(productId: number) {
    setSelectedProductId(productId);
    setTab('automate');
  }
  function goToWithFocus(tabId: TabId, focus: string | null) {
    setProductsFocus((focus as 'lowStock' | 'elevatedReturns' | null) ?? null);
    setTab(tabId);
  }
  function handleSetTab(id: TabId) {
    setProductsFocus(null);
    setTab(id === 'analyze' || id === 'advise' ? 'overview' : id);
  }

  const anyLinked = Object.values(linked).some(Boolean);
  const linkedOrders = orders.filter((o) => linked[o.platform]);

  if (!authed) {
    return (
      <LanguageContext.Provider value={{ lang: uiLang, setLang: setUiLang, t }}>
        <SignIn onSignIn={handleSignIn} />
      </LanguageContext.Provider>
    );
  }

  if (!onboarded) {
    return (
      <LanguageContext.Provider value={{ lang: uiLang, setLang: setUiLang, t }}>
        <ConnectPlatforms linked={linked} setLinked={updateLinked} onContinue={() => setOnboarded(true)} />
      </LanguageContext.Provider>
    );
  }

  const showImpactBanner = SYNC_TABS.includes(tab) && tab !== 'sync-ledger';

  return (
    <LanguageContext.Provider value={{ lang: uiLang, setLang: setUiLang, t }}>
      <AssistantProvider><div className="h-screen h-dvh w-full flex flex-col md:flex-row overflow-hidden" style={{ background: '#F7F8FA', color: '#1F2328' }}>
        <Sidebar tab={tab} setTab={handleSetTab} subscribed={subscribed} user={user} onSignOut={handleSignOut} />
        <main key={tab} id="main-content" className="flex-1 min-h-0 min-w-0 overflow-y-auto">
          {['automate', 'analyze', 'advise', 'messages'].includes(tab) && <AiAllowance onManage={() => handleSetTab('subscription')} />}
          {showImpactBanner && (
            <details className="mx-4 sm:mx-8 mt-6 rounded-xl border border-slate-200 bg-white"><summary className="cursor-pointer px-4 py-3 text-sm text-slate-600">{t('simple.impact')}</summary><ImpactBanner reconcileHours={reconcileHours} overselPrevented={overselPrevented} capitalProtected={capitalProtected} /></details>
          )}

          {tab === 'overview' && (
            <Overview products={products} orders={linkedOrders} anyLinked={anyLinked} linked={linked} messages={messages} setTab={handleSetTab} goToWithFocus={goToWithFocus} />
          )}
          {tab === 'orders' && <OrdersPage orders={linkedOrders} linked={linked} />}
          {tab === 'products' && <ProductsPage products={products} setProducts={setProducts} onEdit={goAutomateFor} onCreate={() => { setSelectedProductId(null); handleSetTab('automate'); }} onManage={() => handleSetTab('subscription')} focus={productsFocus} setFocus={setProductsFocus} />}
          {tab === 'automate' && (

              <><button className="ml-4 sm:ml-8 mt-5 text-sm text-slate-600 underline" onClick={() => handleSetTab('products')}>{t('assist.backProducts')}</button><Automate products={products} setProducts={setProducts} selectedId={selectedProductId} setSelectedId={setSelectedProductId} /></>

          )}


          {tab === 'messages' && (

              <MessagesPage messages={messages.filter(message => linked[message.platform])} setMessages={setMessages} products={products} />

          )}

          {tab === 'action-console' && (
            <ActionConsole products={products} onDraftPO={handleDraftPO} onReallocate={handleReallocate} onLiquidate={handleLiquidate} poCount={pos.length} now={now} />
          )}
          {tab === 'master-catalog' && <MasterCatalog products={products} onResyncAll={handleResyncAll} resyncing={resyncing} now={now} />}
          {tab === 'reservations' && <ReservationEngine holds={holds} now={now} onSimulateLiveDrop={handleSimulateLiveDrop} onForceRelease={handleForceRelease} />}
          {tab === 'sync-ledger' && <SyncLedger events={ledger} onInsertWebhook={handleInsertWebhook} liveFeed={liveFeed} onToggleLiveFeed={() => setLiveFeed((v) => !v)} />}

          {tab === 'subscription' && <SubscriptionPage connectedCount={Object.values(linked).filter(Boolean).length} onManageStores={() => handleSetTab('settings')} />}
          {tab === 'settings' && <SettingsPage user={user} linked={linked} setLinked={updateLinked} setTab={handleSetTab} onSignOut={handleSignOut} />}
        </main>
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} /></AssistantProvider>
    </LanguageContext.Provider>
  );
}







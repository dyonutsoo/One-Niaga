// ============================================================================
// Platforms / channels
// ============================================================================

export type PlatformId = 'shopee' | 'lazada' | 'tiktok' | 'webstore';

export type Platform = {
  id: PlatformId;
  name: string;
  color: string;
};

// ============================================================================
// i18n
// ============================================================================

export type UiLang = 'en' | 'ms' | 'zh';
export type ContentLang = 'en' | 'ms' | 'zh';

// ============================================================================
// Products / catalog
// ============================================================================

export type ReturnReasonKey = 'notAsDescribed' | 'wrongItem' | 'changedMind' | 'damaged';

export type PlatformReturns = {
  total: number;
  reasons: Partial<Record<ReturnReasonKey, number>>;
};

export type PlatformSales = {
  units: number;
  revenue: number;
};

// Per-channel sync/stock mapping used by the inventory-sync engine
// (Master Catalog cross-mapping, Reservation Engine, Sync Ledger).
export type ChannelMapping = {
  externalId: string;
  stock: number;
  synced: boolean;
  lastSyncedAt: number; // epoch ms
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  features: string;
  price: string; // RM, string as typed in the original form
  stock: number; // total sellable units on hand
  dailySales: number; // units/day, blended across channels
  image: string | null;
  descriptions: Partial<Record<PlatformId, string>> | null;
  platformPrices: Partial<Record<PlatformId, number>>;
  published: Partial<Record<PlatformId, boolean>>;
  salesByPlatform: Partial<Record<PlatformId, PlatformSales>>;
  returns: Partial<Record<PlatformId, PlatformReturns>>;
  // Inventory-sync engine fields
  masterStock: number;
  reserved: number;
  channels: Record<PlatformId, ChannelMapping>;
};

// ============================================================================
// Orders
// ============================================================================

export type OrderStatus = 'awaiting' | 'in_progress' | 'delivered';

export type Order = {
  id: string;
  platform: PlatformId;
  orderNo: string;
  customer: string;
  product: string;
  amount: number;
  timestamp: string; // ISO
  status: OrderStatus;
};

// ============================================================================
// Messages
// ============================================================================

export type CustomerMessage = {
  id: string;
  platform: PlatformId;
  customer: string;
  product: string;
  message: string;
  timestamp: string; // ISO
  replied: boolean;
  draft: string | null;
};

// ============================================================================
// Subscription
// ============================================================================

export type PlanId = 'free' | 'growth' | 'pro';

export type PlanDef = {
  id: PlanId;
  name: string;
  price: string;
  storeLimit?: number;
  aiCredits?: number;
  features: string[];
  highlight?: boolean;
};

// ============================================================================
// Advise (AI priorities)
// ============================================================================

export type PriorityLevel = 'high' | 'medium' | 'low';

export type Priority = {
  level: PriorityLevel;
  title: string;
  reason: string;
};

// ============================================================================
// Purchase orders (Action Console)
// ============================================================================

export type POStatus = 'Draft' | 'Sent to Supplier' | 'In Transit';

export type PurchaseOrder = {
  id: string;
  sku: string;
  itemName: string;
  units: number;
  status: POStatus;
  createdAt: number;
  etaDays: number;
};

// ============================================================================
// Sync event ledger
// ============================================================================

export type EventType = 'INBOUND' | 'CALC' | 'OUTBOUND';

export type LedgerEvent = {
  id: string;
  ts: number;
  type: EventType;
  channel: PlatformId | 'SYSTEM';
  latencyMs: number;
  message: string;
};

// ============================================================================
// Reservation / buffer holds
// ============================================================================

export type HoldStatus = 'Active' | 'Expiring' | 'Expired' | 'Released';

export type Hold = {
  id: string;
  channel: PlatformId;
  sku: string;
  itemName: string;
  units: number;
  createdAt: number;
  expiresAt: number;
  status: HoldStatus;
  reason: string;
};

// ============================================================================
// Toasts
// ============================================================================

export type ToastTone = 'success' | 'info' | 'warning';

export type Toast = {
  id: string;
  title: string;
  description: string;
  tone: ToastTone;
};

// ============================================================================
// AI Companion recommendations
// ============================================================================

export type CompanionSeverity = 'critical' | 'high' | 'medium' | 'low';

export type CompanionActionType =
  | 'draft-po'
  | 'reallocate-stock'
  | 'liquidate-deadstock'
  | 'fix-listing'
  | 'standardize-pricing'
  | 'draft-reply'
  | 'release-reservation'
  | 'review-orders';

export type CompanionRecommendation = {
  id: string;
  severity: CompanionSeverity;
  title: string;
  affected: string;
  reason: string;
  impact: string;
  actionLabel: string;
  actionType: CompanionActionType;
  targetTab: TabId;
  targetFocus?: 'lowStock' | 'elevatedReturns' | null;
  productId?: number;
  messageId?: string;
  channel?: PlatformId;
  score: number;
};

// ============================================================================
// Navigation
// ============================================================================

export type TabId =
  | 'overview'
  | 'orders'
  | 'products'
  | 'automate'
  | 'analyze'
  | 'advise'
  | 'messages'
  | 'action-console'
  | 'master-catalog'
  | 'reservations'
  | 'sync-ledger'
  | 'subscription'
  | 'settings';

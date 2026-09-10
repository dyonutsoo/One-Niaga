import type { CustomerMessage, Hold, LedgerEvent, Order, Product, PurchaseOrder } from './types';

export { PLATFORMS, PLATFORM_IDS, CONTENT_LANGUAGES, UI_LANGUAGES } from './platforms';

const NOW = Date.now();

// ============================================================================
// Products — one unified catalog powering Overview / Orders / Products /
// Automate AND the inventory-sync engine (Action Console / Master Catalog /
// Reservation Engine / Sync Ledger). Every number below is internally
// consistent: masterStock === sum of per-channel stock === `stock`.
// ============================================================================

export const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Matcha Clay Mask',
    sku: 'MCM-001',
    category: 'Skincare — mask',
    features: 'Green tea clay, oil control, for combination skin',
    price: '39.90',
    stock: 8,
    dailySales: 3.1,
    image: null,
    descriptions: null,
    masterStock: 8,
    reserved: 2,
    platformPrices: { shopee: 39.9, lazada: 42.9, tiktok: 35.9, webstore: 39.9 },
    published: { shopee: true, lazada: true, tiktok: false, webstore: false },
    salesByPlatform: {
      shopee: { units: 64, revenue: 2554 },
      lazada: { units: 21, revenue: 901 },
      tiktok: { units: 38, revenue: 1364 },
      webstore: { units: 0, revenue: 0 },
    },
    returns: {
      shopee: { total: 4, reasons: { notAsDescribed: 1, wrongItem: 0, changedMind: 2, damaged: 1 } },
      lazada: { total: 6, reasons: { notAsDescribed: 4, wrongItem: 1, changedMind: 1, damaged: 0 } },
      tiktok: { total: 2, reasons: { notAsDescribed: 0, wrongItem: 0, changedMind: 1, damaged: 1 } },
      webstore: { total: 0, reasons: {} },
    },
    channels: {
      shopee: { externalId: 'SP-100234', stock: 4, synced: true, lastSyncedAt: NOW - 6 * 60 * 1000 },
      lazada: { externalId: 'LZ-40018', stock: 2, synced: true, lastSyncedAt: NOW - 9 * 60 * 1000 },
      tiktok: { externalId: 'TT-PID-88213', stock: 2, synced: true, lastSyncedAt: NOW - 2 * 60 * 1000 },
      webstore: { externalId: 'WS-0001', stock: 0, synced: true, lastSyncedAt: NOW - 20 * 60 * 1000 },
    },
  },
  {
    id: 2,
    name: 'Vitamin C Serum 30ml',
    sku: 'VCS-030',
    category: 'Skincare — serum',
    features: '10% Vit C, brightening, fragrance-free',
    price: '68.00',
    stock: 42,
    dailySales: 1.4,
    image: null,
    descriptions: null,
    masterStock: 42,
    reserved: 3,
    platformPrices: { shopee: 68.0, lazada: 68.0, tiktok: 65.0, webstore: 68.0 },
    published: { shopee: true, lazada: true, tiktok: true, webstore: false },
    salesByPlatform: {
      shopee: { units: 30, revenue: 2040 },
      lazada: { units: 18, revenue: 1224 },
      tiktok: { units: 12, revenue: 780 },
      webstore: { units: 0, revenue: 0 },
    },
    returns: {
      shopee: { total: 1, reasons: { notAsDescribed: 0, wrongItem: 0, changedMind: 1, damaged: 0 } },
      lazada: { total: 0, reasons: {} },
      tiktok: { total: 1, reasons: { notAsDescribed: 0, wrongItem: 0, changedMind: 0, damaged: 1 } },
      webstore: { total: 0, reasons: {} },
    },
    channels: {
      shopee: { externalId: 'SP-100987', stock: 18, synced: true, lastSyncedAt: NOW - 3 * 60 * 1000 },
      lazada: { externalId: 'LZ-40077', stock: 14, synced: true, lastSyncedAt: NOW - 7 * 60 * 1000 },
      tiktok: { externalId: 'TT-PID-91002', stock: 10, synced: false, lastSyncedAt: NOW - 26 * 60 * 1000 },
      webstore: { externalId: 'WS-0002', stock: 0, synced: true, lastSyncedAt: NOW - 15 * 60 * 1000 },
    },
  },
  {
    id: 3,
    name: 'Rose Lip Tint',
    sku: 'RLT-004',
    category: 'Makeup — lip',
    features: 'Long-wear, rose tint, non-drying',
    price: '24.90',
    stock: 50,
    dailySales: 2.6,
    image: null,
    descriptions: null,
    masterStock: 50,
    reserved: 0,
    platformPrices: { shopee: 24.9, lazada: 26.9, tiktok: 19.9, webstore: 24.9 },
    published: { shopee: true, lazada: true, tiktok: true, webstore: false },
    salesByPlatform: {
      shopee: { units: 45, revenue: 1120 },
      lazada: { units: 0, revenue: 0 },
      tiktok: { units: 52, revenue: 1035 },
      webstore: { units: 0, revenue: 0 },
    },
    returns: {
      shopee: { total: 2, reasons: { notAsDescribed: 1, wrongItem: 0, changedMind: 1, damaged: 0 } },
      lazada: { total: 1, reasons: { notAsDescribed: 1, wrongItem: 0, changedMind: 0, damaged: 0 } },
      tiktok: { total: 3, reasons: { notAsDescribed: 0, wrongItem: 1, changedMind: 2, damaged: 0 } },
      webstore: { total: 0, reasons: {} },
    },
    channels: {
      shopee: { externalId: 'SP-119004', stock: 5, synced: true, lastSyncedAt: NOW - 8 * 60 * 1000 },
      lazada: { externalId: 'LZ-SKU-33871', stock: 45, synced: true, lastSyncedAt: NOW - 4 * 60 * 1000 },
      tiktok: { externalId: 'TT-PID-77820', stock: 0, synced: true, lastSyncedAt: NOW - 1 * 60 * 1000 },
      webstore: { externalId: 'WS-0022', stock: 0, synced: true, lastSyncedAt: NOW - 9 * 60 * 1000 },
    },
  },
  {
    id: 4,
    name: 'Centella Calming Toner 200ml',
    sku: 'CT-200',
    category: 'Skincare — toner',
    features: 'Alcohol-free, centella asiatica, sensitive skin',
    price: '45.50',
    stock: 3,
    dailySales: 4.2,
    image: null,
    descriptions: null,
    masterStock: 3,
    reserved: 0,
    platformPrices: { shopee: 45.5, lazada: 45.5, tiktok: 45.5, webstore: 45.5 },
    published: { shopee: true, lazada: true, tiktok: false, webstore: false },
    salesByPlatform: {
      shopee: { units: 22, revenue: 1001 },
      lazada: { units: 14, revenue: 637 },
      tiktok: { units: 0, revenue: 0 },
      webstore: { units: 0, revenue: 0 },
    },
    returns: {
      shopee: { total: 1, reasons: { notAsDescribed: 0, wrongItem: 0, changedMind: 0, damaged: 1 } },
      lazada: { total: 0, reasons: {} },
      tiktok: { total: 0, reasons: {} },
      webstore: { total: 0, reasons: {} },
    },
    channels: {
      shopee: { externalId: 'SP-101550', stock: 2, synced: true, lastSyncedAt: NOW - 5 * 60 * 1000 },
      lazada: { externalId: 'LZ-40133', stock: 1, synced: true, lastSyncedAt: NOW - 6 * 60 * 1000 },
      tiktok: { externalId: 'TT-PID-93318', stock: 0, synced: true, lastSyncedAt: NOW - 12 * 60 * 1000 },
      webstore: { externalId: 'WS-0003', stock: 0, synced: true, lastSyncedAt: NOW - 30 * 60 * 1000 },
    },
  },
  {
    id: 5,
    name: 'Oversized Hoodie — Charcoal',
    sku: 'OH-001',
    category: 'Apparel — outerwear',
    features: 'Heavyweight cotton fleece, oversized fit, dropped shoulder',
    price: '89.00',
    stock: 24,
    dailySales: 18,
    image: null,
    descriptions: null,
    masterStock: 24,
    reserved: 6,
    platformPrices: { shopee: 89, lazada: 92, tiktok: 85, webstore: 89 },
    published: { shopee: true, lazada: true, tiktok: true, webstore: false },
    salesByPlatform: {
      shopee: { units: 58, revenue: 5162 },
      lazada: { units: 12, revenue: 1104 },
      tiktok: { units: 74, revenue: 6290 },
      webstore: { units: 0, revenue: 0 },
    },
    returns: {
      shopee: { total: 2, reasons: { notAsDescribed: 0, wrongItem: 1, changedMind: 1, damaged: 0 } },
      lazada: { total: 0, reasons: {} },
      tiktok: { total: 3, reasons: { notAsDescribed: 0, wrongItem: 2, changedMind: 1, damaged: 0 } },
      webstore: { total: 0, reasons: {} },
    },
    channels: {
      shopee: { externalId: 'SP-887234', stock: 11, synced: true, lastSyncedAt: NOW - 2 * 60 * 1000 },
      lazada: { externalId: 'LZ-SKU-90142', stock: 4, synced: true, lastSyncedAt: NOW - 5 * 60 * 1000 },
      tiktok: { externalId: 'TT-PID-55210', stock: 9, synced: true, lastSyncedAt: NOW - 3 * 60 * 1000 },
      webstore: { externalId: 'WS-0011', stock: 0, synced: true, lastSyncedAt: NOW - 5 * 60 * 1000 },
    },
  },
  {
    id: 6,
    name: 'Canvas Tote Bag — Natural',
    sku: 'CTB-001',
    category: 'Accessories — bags',
    features: '100% cotton canvas, reinforced handles, 38x42cm',
    price: '29.90',
    stock: 68,
    dailySales: 0.4,
    image: null,
    descriptions: null,
    masterStock: 68,
    reserved: 0,
    platformPrices: { shopee: 29.9, lazada: 32.9, tiktok: 27.9, webstore: 29.9 },
    published: { shopee: true, lazada: true, tiktok: true, webstore: false },
    salesByPlatform: {
      shopee: { units: 2, revenue: 60 },
      lazada: { units: 1, revenue: 33 },
      tiktok: { units: 0, revenue: 0 },
      webstore: { units: 0, revenue: 0 },
    },
    returns: {
      shopee: { total: 0, reasons: {} },
      lazada: { total: 0, reasons: {} },
      tiktok: { total: 0, reasons: {} },
      webstore: { total: 0, reasons: {} },
    },
    channels: {
      shopee: { externalId: 'SP-220981', stock: 40, synced: true, lastSyncedAt: NOW - 40 * 60 * 1000 },
      lazada: { externalId: 'LZ-SKU-58120', stock: 10, synced: true, lastSyncedAt: NOW - 33 * 60 * 1000 },
      tiktok: { externalId: 'TT-PID-10093', stock: 18, synced: true, lastSyncedAt: NOW - 55 * 60 * 1000 },
      webstore: { externalId: 'WS-0033', stock: 0, synced: true, lastSyncedAt: NOW - 55 * 60 * 1000 },
    },
  },
];

// ============================================================================
// Weekly platform revenue (Overview + Analyze charts)
// ============================================================================

export const WEEKLY_SALES = [
  { day: 'Mon', Shopee: 820, Lazada: 410, 'TikTok Shop': 260, Webstore: 60 },
  { day: 'Tue', Shopee: 760, Lazada: 430, 'TikTok Shop': 340, Webstore: 55 },
  { day: 'Wed', Shopee: 690, Lazada: 395, 'TikTok Shop': 410, Webstore: 70 },
  { day: 'Thu', Shopee: 710, Lazada: 402, 'TikTok Shop': 505, Webstore: 65 },
  { day: 'Fri', Shopee: 640, Lazada: 388, 'TikTok Shop': 612, Webstore: 80 },
  { day: 'Sat', Shopee: 590, Lazada: 360, 'TikTok Shop': 705, Webstore: 90 },
  { day: 'Sun', Shopee: 605, Lazada: 375, 'TikTok Shop': 780, Webstore: 85 },
];

// ============================================================================
// Orders
// ============================================================================

export const SEED_ORDERS: Order[] = [
  { id: 'o1', platform: 'shopee', orderNo: 'SP-88213', customer: 'Aina R.', product: 'Matcha Clay Mask', amount: 39.9, timestamp: '2026-08-24T09:15:00', status: 'awaiting' },
  { id: 'o2', platform: 'lazada', orderNo: 'LZ-40921', customer: 'Wei Ming', product: 'Centella Calming Toner 200ml', amount: 45.5, timestamp: '2026-08-24T09:15:00', status: 'awaiting' },
  { id: 'o3', platform: 'tiktok', orderNo: 'TT-10552', customer: 'Farah_88', product: 'Rose Lip Tint', amount: 24.9, timestamp: '2026-08-24T08:40:00', status: 'in_progress' },
  { id: 'o4', platform: 'shopee', orderNo: 'SP-88190', customer: 'Kavitha S.', product: 'Vitamin C Serum 30ml', amount: 68.0, timestamp: '2026-08-24T07:55:00', status: 'delivered' },
  { id: 'o5', platform: 'tiktok', orderNo: 'TT-10548', customer: 'limjieee', product: 'Oversized Hoodie — Charcoal', amount: 85.0, timestamp: '2026-08-24T07:55:00', status: 'in_progress' },
  { id: 'o6', platform: 'lazada', orderNo: 'LZ-40905', customer: 'Nur Aisyah', product: 'Rose Lip Tint', amount: 26.9, timestamp: '2026-08-23T21:30:00', status: 'delivered' },
  { id: 'o7', platform: 'shopee', orderNo: 'SP-88177', customer: 'Daniel T.', product: 'Oversized Hoodie — Charcoal', amount: 89.0, timestamp: '2026-08-23T19:10:00', status: 'in_progress' },
  { id: 'o8', platform: 'tiktok', orderNo: 'TT-10531', customer: 'chloe.wongg', product: 'Vitamin C Serum 30ml', amount: 65.0, timestamp: '2026-08-23T18:05:00', status: 'awaiting' },
  { id: 'o9', platform: 'lazada', orderNo: 'LZ-40888', customer: 'Muthu K.', product: 'Matcha Clay Mask', amount: 42.9, timestamp: '2026-08-23T15:20:00', status: 'delivered' },
  { id: 'o10', platform: 'shopee', orderNo: 'SP-88150', customer: 'Siti Hajar', product: 'Rose Lip Tint', amount: 24.9, timestamp: '2026-08-23T11:45:00', status: 'awaiting' },
  { id: 'o11', platform: 'tiktok', orderNo: 'TT-10519', customer: 'rachel_koh', product: 'Centella Calming Toner 200ml', amount: 45.5, timestamp: '2026-08-23T10:00:00', status: 'delivered' },
  { id: 'o12', platform: 'lazada', orderNo: 'LZ-40860', customer: 'Hafiz A.', product: 'Vitamin C Serum 30ml', amount: 68.0, timestamp: '2026-08-22T16:30:00', status: 'delivered' },
  { id: 'o13', platform: 'shopee', orderNo: 'SP-88240', customer: 'Grace L.', product: 'Canvas Tote Bag — Natural', amount: 29.9, timestamp: '2026-08-22T13:05:00', status: 'delivered' },
];

// ============================================================================
// Customer messages
// ============================================================================

export const SEED_MESSAGES: CustomerMessage[] = [
  { id: 'm1', platform: 'shopee', customer: 'Aina R.', product: 'Matcha Clay Mask', message: 'Hi, is this suitable for oily and acne prone skin? Also when will my order ship?', timestamp: '2026-08-24T09:20:00', replied: false, draft: null },
  { id: 'm2', platform: 'lazada', customer: 'Wei Ming', product: 'Centella Calming Toner 200ml', message: 'The bottle I received looks different from the photo on the listing, is this normal?', timestamp: '2026-08-24T08:05:00', replied: false, draft: null },
  { id: 'm3', platform: 'tiktok', customer: 'Farah_88', product: 'Rose Lip Tint', message: 'can i get this in a different shade?? saw other sellers have more colors', timestamp: '2026-08-23T22:40:00', replied: false, draft: null },
  { id: 'm4', platform: 'shopee', customer: 'Kavitha S.', product: 'Vitamin C Serum 30ml', message: 'Thank you, product arrived safely and works great!', timestamp: '2026-08-23T14:10:00', replied: true, draft: "Thank you so much for your kind words! So glad it's working well for you 💛" },
  { id: 'm5', platform: 'tiktok', customer: 'limjieee', product: 'Oversized Hoodie — Charcoal', message: 'is this true to size or should i size down? im usually a medium', timestamp: '2026-08-23T20:15:00', replied: false, draft: null },
];

// ============================================================================
// Subscription plans
// ============================================================================

export { PLAN_DEFS } from './plans';

// ============================================================================
// Inventory-sync engine — reservation holds and the sync ledger
// ============================================================================

export function seedHolds(): Hold[] {
  return [
    {
      id: 'HOLD-1001',
      channel: 'tiktok',
      sku: 'OH-001',
      itemName: 'Oversized Hoodie — Charcoal',
      units: 6,
      createdAt: NOW - 105 * 60 * 1000,
      expiresAt: NOW + 15 * 60 * 1000,
      status: 'Active',
      reason: 'TikTok Live Drop hold',
    },
    {
      id: 'HOLD-1002',
      channel: 'shopee',
      sku: 'MCM-001',
      itemName: 'Matcha Clay Mask',
      units: 2,
      createdAt: NOW - 118 * 60 * 1000,
      expiresAt: NOW + 90 * 1000,
      status: 'Active',
      reason: 'Flash Sale buffer',
    },
    {
      id: 'HOLD-1003',
      channel: 'lazada',
      sku: 'VCS-030',
      itemName: 'Vitamin C Serum 30ml',
      units: 3,
      createdAt: NOW - 130 * 60 * 1000,
      expiresAt: NOW - 4 * 60 * 1000,
      status: 'Expired',
      reason: 'Unpaid checkout lock',
    },
    {
      id: 'HOLD-1004',
      channel: 'shopee',
      sku: 'RLT-004',
      itemName: 'Rose Lip Tint',
      units: 2,
      createdAt: NOW - 90 * 60 * 1000,
      expiresAt: NOW - 12 * 60 * 1000,
      status: 'Expired',
      reason: 'Unpaid checkout lock',
    },
  ];
}

export function seedLedger(): LedgerEvent[] {
  const base = NOW - 6 * 60 * 1000;
  return [
    { id: 'EVT-1001', ts: base, type: 'INBOUND', channel: 'shopee', latencyMs: 142, message: 'order.created — SP-887234 x1 received' },
    { id: 'EVT-1002', ts: base + 8000, type: 'CALC', channel: 'SYSTEM', latencyMs: 21, message: 'Master stock recalculated for OH-001 (24 → 23)' },
    { id: 'EVT-1003', ts: base + 15000, type: 'OUTBOUND', channel: 'tiktok', latencyMs: 233, message: 'stock.update pushed — TT-PID-55210 set to 9' },
    { id: 'EVT-1004', ts: base + 15900, type: 'OUTBOUND', channel: 'lazada', latencyMs: 268, message: 'stock.update pushed — LZ-SKU-90142 set to 4' },
    { id: 'EVT-1005', ts: base + 60000, type: 'INBOUND', channel: 'tiktok', latencyMs: 176, message: 'webhook.live_drop — hold requested, 6 units OH-001' },
    { id: 'EVT-1006', ts: base + 61200, type: 'CALC', channel: 'SYSTEM', latencyMs: 18, message: 'Reservation buffer created HOLD-1001 — 6 units locked' },
    { id: 'EVT-1007', ts: base + 120000, type: 'INBOUND', channel: 'lazada', latencyMs: 198, message: 'order.created — LZ-40133 x1 received' },
    { id: 'EVT-1008', ts: base + 128000, type: 'OUTBOUND', channel: 'shopee', latencyMs: 211, message: 'stock.update pushed — SP-101550 set to 2' },
    { id: 'EVT-1009', ts: base + 128600, type: 'OUTBOUND', channel: 'webstore', latencyMs: 94, message: 'stock.update pushed — WS-0002 confirmed' },
  ];
}

export function seedPurchaseOrders(): PurchaseOrder[] {
  return [];
}


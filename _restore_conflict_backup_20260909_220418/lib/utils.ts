import type { Order, PlatformReturns, Product, ReturnReasonKey } from './types';
import { PLATFORMS } from './platforms';

let idCounter = 1000;
export function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function rm(value: number) {
  return `RM ${value.toLocaleString('en-MY', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function platformName(id: string) {
  return PLATFORMS.find((p) => p.id === id)?.name || id;
}

export function topReturnReason(
  reasons: Partial<Record<ReturnReasonKey, number>> | undefined
): { key: ReturnReasonKey; count: number } | null {
  if (!reasons) return null;
  const entries = Object.entries(reasons).filter(([, v]) => (v ?? 0) > 0) as [ReturnReasonKey, number][];
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { key: entries[0][0], count: entries[0][1] };
}

export function totalReturns(returnsObj: Partial<Record<string, PlatformReturns>> | undefined) {
  if (!returnsObj) return 0;
  return Object.values(returnsObj).reduce((s, p) => s + (p?.total || 0), 0);
}

export function priceSpread(prices: Partial<Record<string, number>> | undefined) {
  const vals = Object.values(prices || {}).filter((v): v is number => typeof v === 'number' && !isNaN(v));
  if (vals.length < 2) return 0;
  return Math.max(...vals) - Math.min(...vals);
}

export function sortOrdersByTimestamp(orders: Order[]) {
  return orders.slice().sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    if (ta !== tb) return ta - tb;
    return platformName(a.platform).localeCompare(platformName(b.platform));
  });
}

export function sortOrdersBy(orders: Order[], key: string, dir: 'asc' | 'desc') {
  return orders.slice().sort((a, b) => {
    let cmp = 0;
    if (key === 'timestamp') {
      cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (cmp === 0) cmp = platformName(a.platform).localeCompare(platformName(b.platform));
    } else if (key === 'amount') {
      cmp = a.amount - b.amount;
    } else if (key === 'status') {
      cmp = a.status.localeCompare(b.status);
    } else if (key === 'platform') {
      cmp = platformName(a.platform).localeCompare(platformName(b.platform));
    } else if (key === 'orderNo') {
      cmp = a.orderNo.localeCompare(b.orderNo, undefined, { numeric: true });
    } else if (key === 'customer') {
      cmp = a.customer.localeCompare(b.customer);
    } else if (key === 'product') {
      cmp = a.product.localeCompare(b.product);
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function formatTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString('en-MY', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(ts: number, now: number) {
  const diff = Math.max(0, now - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function formatCountdown(msRemaining: number) {
  if (msRemaining <= 0) return '00:00:00';
  const totalSec = Math.floor(msRemaining / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatClock(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-MY', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function stockDaysLeft(p: Pick<Product, 'stock' | 'dailySales'>) {
  return +(p.stock / p.dailySales).toFixed(1);
}

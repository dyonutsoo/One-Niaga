import type { LedgerEvent } from './types';
export function activityKey(event: LedgerEvent): string {
  const message = event.message.toLowerCase();
  if (message.includes('hold.release')) return 'activity.released';
  if (message.includes('order.created')) return 'activity.order';
  if (message.includes('webhook.live_drop') || message.includes('hold requested')) return 'activity.reserved';
  if (message.includes('stock.update') || message.includes('stock snapshot')) return 'activity.stock';
  if (message.includes('campaign.create')) return 'activity.campaign';
  if (event.type === 'CALC') return 'activity.calculation';
  return event.type === 'INBOUND' ? 'activity.received' : 'activity.sent';
}

import { PLATFORMS } from './platforms';
import { platformName, priceSpread, rm, topReturnReason, totalReturns } from './utils';
import type {
  CompanionRecommendation,
  CustomerMessage,
  Hold,
  Order,
  PlatformId,
  Product,
} from './types';

type BuildInput = {
  products: Product[];
  orders: Order[];
  messages: CustomerMessage[];
  linked: Record<PlatformId, boolean>;
  holds?: Hold[];
  now?: number;
};

function pushUnique(list: CompanionRecommendation[], rec: CompanionRecommendation) {
  if (!list.some((item) => item.id === rec.id)) list.push(rec);
}

function bestSalesChannel(product: Product): PlatformId | null {
  let best: { id: PlatformId; units: number } | null = null;
  for (const platform of PLATFORMS) {
    const units = product.salesByPlatform[platform.id]?.units ?? 0;
    if (!best || units > best.units) best = { id: platform.id, units };
  }
  return best && best.units > 0 ? best.id : null;
}

function idleStockChannel(product: Product, exclude: PlatformId | null): PlatformId | null {
  let best: { id: PlatformId; stock: number; units: number } | null = null;
  for (const platform of PLATFORMS) {
    if (platform.id === exclude) continue;
    const stock = product.channels[platform.id].stock;
    const units = product.salesByPlatform[platform.id]?.units ?? 0;
    if (stock <= 10) continue;
    if (!best || stock > best.stock || (stock === best.stock && units < best.units)) {
      best = { id: platform.id, stock, units };
    }
  }
  return best?.id ?? null;
}

export function buildCompanionRecommendations({
  products,
  orders,
  messages,
  linked,
  holds = [],
  now = Date.now(),
}: BuildInput): CompanionRecommendation[] {
  const recs: CompanionRecommendation[] = [];
  const linkedPlatforms = new Set(PLATFORMS.filter((p) => linked[p.id]).map((p) => p.id));

  for (const product of products) {
    const daysLeft = product.dailySales > 0 ? product.stock / product.dailySales : Infinity;
    if (daysLeft < 2.5) {
      pushUnique(recs, {
        id: `stockout-${product.sku}`,
        severity: daysLeft < 1.5 ? 'critical' : 'high',
        title: `Restock ${product.name} before it runs out`,
        affected: `${product.sku} · ${daysLeft.toFixed(1)} days left`,
        reason: `${product.stock} units remain while the SKU sells about ${product.dailySales} units per day.`,
        impact: rm(Math.max(280, Math.round(product.dailySales * 2 * (Number(product.price) || 39)))),
        actionLabel: 'Approve supplier PO draft',
        actionType: 'draft-po',
        targetTab: 'action-console',
        targetFocus: 'lowStock',
        productId: product.id,
        score: 100 - daysLeft * 12,
      });
    }

    const spread = priceSpread(product.platformPrices);
    if (spread > 3) {
      pushUnique(recs, {
        id: `pricing-${product.sku}`,
        severity: spread > 6 ? 'high' : 'medium',
        title: `Standardize ${product.name} pricing`,
        affected: `${product.sku} · RM ${spread.toFixed(2)} platform gap`,
        reason: 'Large price gaps can reduce trust and push buyers to compare your stores against each other.',
        impact: rm(Math.round(spread * Math.max(8, product.dailySales * 4))),
        actionLabel: 'Review platform prices',
        actionType: 'standardize-pricing',
        targetTab: 'products',
        productId: product.id,
        score: 58 + spread,
      });
    }

    const returns = totalReturns(product.returns);
    if (returns > 2) {
      const top = PLATFORMS.map((platform) => {
        const platformReturns = product.returns[platform.id];
        return {
          platform: platform.id,
          total: platformReturns?.total ?? 0,
          reason: topReturnReason(platformReturns?.reasons),
        };
      }).sort((a, b) => b.total - a.total)[0];
      pushUnique(recs, {
        id: `returns-${product.sku}`,
        severity: returns > 5 ? 'high' : 'medium',
        title: `Fix the listing expectation gap for ${product.name}`,
        affected: `${returns} returns · ${top?.platform ? platformName(top.platform) : 'all channels'}`,
        reason: top?.reason
          ? `${top.reason.count} returns point to ${top.reason.key}; the listing likely needs clearer claims or photos.`
          : 'Returns are elevated across channels and may be hurting buyer trust.',
        impact: rm(Math.max(180, returns * 45)),
        actionLabel: 'Prepare listing fix',
        actionType: 'fix-listing',
        targetTab: 'automate',
        targetFocus: 'elevatedReturns',
        productId: product.id,
        channel: top?.platform,
        score: 64 + returns * 2,
      });
    }

    const demandChannel = bestSalesChannel(product);
    const stockChannel = idleStockChannel(product, demandChannel);
    if (demandChannel && stockChannel && product.channels[demandChannel].stock <= 2) {
      pushUnique(recs, {
        id: `mismatch-${product.sku}`,
        severity: 'high',
        title: `Move stock to ${platformName(demandChannel)} demand`,
        affected: `${product.sku} · ${platformName(demandChannel)} low, ${platformName(stockChannel)} holding stock`,
        reason: `${platformName(demandChannel)} is the strongest sales channel, but it has only ${product.channels[demandChannel].stock} sellable units.`,
        impact: rm(Math.max(240, Math.round((product.salesByPlatform[demandChannel]?.revenue ?? 400) / 3))),
        actionLabel: 'Approve stock reallocation',
        actionType: 'reallocate-stock',
        targetTab: 'action-console',
        productId: product.id,
        channel: demandChannel,
        score: 78,
      });
    }

    if (product.masterStock >= 45 && product.dailySales < 1) {
      pushUnique(recs, {
        id: `deadstock-${product.sku}`,
        severity: 'medium',
        title: `Turn idle ${product.name} stock into cash`,
        affected: `${product.masterStock} units · ${product.dailySales} units/day`,
        reason: 'Stock is moving slowly enough that working capital may stay trapped for weeks.',
        impact: rm(Math.max(500, Math.round(product.masterStock * (Number(product.price) || 35) * 0.45))),
        actionLabel: 'Approve campaign draft',
        actionType: 'liquidate-deadstock',
        targetTab: 'action-console',
        productId: product.id,
        score: 55 + product.masterStock / 5,
      });
    }
  }

  const unreplied = messages.filter((m) => !m.replied && linkedPlatforms.has(m.platform));
  if (unreplied.length > 0) {
    const oldest = unreplied.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    pushUnique(recs, {
      id: `messages-${oldest.id}`,
      severity: unreplied.length > 2 ? 'high' : 'medium',
      title: 'Reply to customer messages',
      affected: `${unreplied.length} unreplied message${unreplied.length === 1 ? '' : 's'} · oldest from ${oldest.customer}`,
      reason: `${platformName(oldest.platform)} buyers are waiting, and quick replies can protect conversion and ratings.`,
      impact: rm(Math.max(120, unreplied.length * 85)),
      actionLabel: 'Open reply queue',
      actionType: 'draft-reply',
      targetTab: 'messages',
      messageId: oldest.id,
      channel: oldest.platform,
      score: 70 + unreplied.length * 4,
    });
  }

  const awaiting = orders.filter((o) => o.status === 'awaiting');
  if (awaiting.length > 0) {
    pushUnique(recs, {
      id: 'orders-awaiting',
      severity: awaiting.length > 3 ? 'high' : 'medium',
      title: 'Clear awaiting orders before the queue grows',
      affected: `${awaiting.length} order${awaiting.length === 1 ? '' : 's'} awaiting fulfilment`,
      reason: 'Fulfilment delays can create rating risk and increase support messages across channels.',
      impact: rm(awaiting.reduce((sum, order) => sum + order.amount, 0)),
      actionLabel: 'Review orders',
      actionType: 'review-orders',
      targetTab: 'orders',
      score: 62 + awaiting.length * 3,
    });
  }

  const expiredHolds = holds.filter((hold) => hold.status === 'Expired' && hold.expiresAt <= now);
  if (expiredHolds.length > 0) {
    pushUnique(recs, {
      id: 'reservations-expired',
      severity: 'medium',
      title: 'Release expired reserved stock',
      affected: `${expiredHolds.reduce((sum, hold) => sum + hold.units, 0)} units locked after expiry`,
      reason: 'Expired holds hide sellable stock from public channels and can create false stockout pressure.',
      impact: rm(expiredHolds.reduce((sum, hold) => sum + hold.units * 39, 0)),
      actionLabel: 'Release expired holds',
      actionType: 'release-reservation',
      targetTab: 'reservations',
      channel: expiredHolds[0]?.channel,
      score: 68,
    });
  }

  return recs.sort((a, b) => b.score - a.score);
}

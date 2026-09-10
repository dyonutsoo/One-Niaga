'use client';

import { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, X } from 'lucide-react';
import { BORDER, CORAL, CREAM, INK, MUTED, NAVY, ORDERS_GRID_COLS, STATUS_COLORS } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { SEED_PRODUCTS } from '@/lib/seed';
import { useLang } from '@/lib/i18n';
import { PageHeader } from '../ui';
import { formatTs, sortOrdersBy } from '@/lib/utils';
import type { Order, PlatformId } from '@/lib/types';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function ymd(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

function OrderDatePicker({
  orders,
  value,
  onChange,
  t,
}: {
  orders: Order[];
  value: string;
  onChange: (v: string) => void;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const base = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  const orderDateSet = new Set(orders.map((o) => o.timestamp.slice(0, 10)));

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: daysInPrevMonth - startWeekday + 1 + i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - startWeekday - daysInMonth + 1, current: false });

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
  }

  const monthLabel = firstOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());
  const displayLabel = value ? new Date(value + 'T00:00:00').toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' }) : t('orders.pickDate');

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px]" style={{ border: `1px solid ${BORDER}`, background: 'white', color: value ? INK : MUTED }}>
        <CalendarDays size={14} style={{ color: MUTED }} />
        {displayLabel}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 rounded-xl p-3" style={{ background: 'white', border: `1px solid ${BORDER}`, boxShadow: '0 10px 28px rgba(0,0,0,0.14)', width: 268, maxWidth: '90vw' }}>
            <div className="flex items-center justify-between mb-2 px-0.5">
              <button onClick={prevMonth} className="p-1 rounded-md" style={{ color: MUTED }}><ChevronLeft size={15} /></button>
              <span className="text-[12.5px] font-semibold" style={{ color: NAVY }}>{monthLabel}</span>
              <button onClick={nextMonth} className="p-1 rounded-md" style={{ color: MUTED }}><ChevronRight size={15} /></button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {weekdayLabels.map((w) => (
                <div key={w} className="text-[10px] text-center font-medium" style={{ color: '#9A927E' }}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((c, i) => {
                const ds = c.current ? ymd(viewYear, viewMonth, c.day) : null;
                const hasOrders = ds && orderDateSet.has(ds);
                const isSelected = ds && ds === value;
                const isToday = ds && ds === todayStr;
                return (
                  <button
                    key={i}
                    disabled={!c.current}
                    onClick={() => {
                      if (ds) {
                        onChange(ds);
                        setOpen(false);
                      }
                    }}
                    className="relative h-8 rounded-md text-[11.5px] flex items-center justify-center"
                    style={{
                      color: !c.current ? '#D8D4CB' : isSelected ? 'white' : INK,
                      background: isSelected ? NAVY : isToday ? CREAM : 'transparent',
                      fontWeight: isToday || isSelected ? 700 : 400,
                      cursor: c.current ? 'pointer' : 'default',
                    }}
                  >
                    {c.day}
                    {hasOrders && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? '#8FD9B6' : CORAL }} />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
              <button onClick={() => { onChange(''); setOpen(false); }} className="text-[11.5px] font-semibold" style={{ color: MUTED }}>{t('orders.clearDate')}</button>
              <span className="flex items-center gap-1 text-[10px]" style={{ color: '#9A927E' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: CORAL }} /> {t('orders.hasOrders')}
              </span>
              <button onClick={() => { onChange(todayStr); setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setOpen(false); }} className="text-[11.5px] font-semibold" style={{ color: CORAL }}>{t('orders.today')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onClick,
}: {
  label: string;
  sortKey: string;
  activeKey: string;
  dir: 'asc' | 'desc';
  onClick: (key: string) => void;
}) {
  const active = sortKey === activeKey;
  return (
    <button onClick={() => onClick(sortKey)} className="flex items-center gap-1 text-left truncate" style={{ color: active ? NAVY : MUTED }}>
      <span className="truncate">{label}</span>
      {active ? dir === 'asc' ? <ChevronUp size={12} className="shrink-0" /> : <ChevronDown size={12} className="shrink-0" /> : <ChevronsUpDown size={11} className="shrink-0" style={{ opacity: 0.4 }} />}
    </button>
  );
}

type FilterOption = { id: string; label: string; color?: string };

function CategoryFilter({
  label,
  options,
  selected,
  onChange,
  t,
}: {
  label: string;
  options: FilterOption[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const allSelected = selected.size === options.length;
  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }
  const displayLabel = allSelected ? label : `${label} (${selected.size})`;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium"
        style={{ border: `1px solid ${allSelected ? BORDER : CORAL}`, background: allSelected ? 'white' : '#FBE4DB', color: allSelected ? INK : CORAL }}
      >
        {displayLabel} <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-2 rounded-xl p-3" style={{ background: 'white', border: `1px solid ${BORDER}`, boxShadow: '0 10px 28px rgba(0,0,0,0.14)', width: 210, maxWidth: '90vw' }}>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-[12.5px] py-1 cursor-pointer">
                  <input type="checkbox" checked={selected.has(opt.id)} onChange={() => toggle(opt.id)} style={{ accentColor: CORAL }} />
                  {opt.color && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: opt.color }} />}
                  <span style={{ color: INK }}>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
              <button onClick={() => onChange(new Set(options.map((o) => o.id)))} className="text-[11px] font-semibold" style={{ color: NAVY }}>{t('orders.selectAll')}</button>
              <button onClick={() => onChange(new Set())} className="text-[11px] font-semibold" style={{ color: MUTED }}>{t('orders.clearSelection')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function OrdersPage({ orders, linked }: { orders: Order[]; linked: Record<PlatformId, boolean> }) {
  const { t } = useLang();
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [dateFilter, setDateFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Set<string>>(new Set(PLATFORMS.map((p) => p.id)));
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(Object.keys(STATUS_COLORS)));
  const productOptionList = SEED_PRODUCTS.map((p) => p.name);
  const [productFilter, setProductFilter] = useState<Set<string>>(new Set(productOptionList));

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const platformOptions: FilterOption[] = PLATFORMS.map((p) => ({ id: p.id, label: p.name, color: p.color }));
  const statusOptions: FilterOption[] = Object.entries(STATUS_COLORS).map(([k, v]) => ({ id: k, label: t(`status.${k}`), color: v.fg }));
  const productOptions: FilterOption[] = productOptionList.map((name) => ({ id: name, label: name }));

  const filtersActive = platformFilter.size < platformOptions.length || statusFilter.size < statusOptions.length || productFilter.size < productOptions.length;

  function clearAllFilters() {
    setPlatformFilter(new Set(platformOptions.map((o) => o.id)));
    setStatusFilter(new Set(statusOptions.map((o) => o.id)));
    setProductFilter(new Set(productOptions.map((o) => o.id)));
  }

  const filtered = orders.filter(
    (o) =>
      (!dateFilter || o.timestamp.slice(0, 10) === dateFilter) &&
      platformFilter.has(o.platform) &&
      statusFilter.has(o.status) &&
      productFilter.has(o.product)
  );
  const sorted = sortOrdersBy(filtered, sortKey, sortDir);
  const unlinkedPlatforms = PLATFORMS.filter((p) => !linked[p.id]);

  return (
    <div>
      <PageHeader eyebrow={t('nav.orders')} title={t('orders.title')} desc={t('orders.desc')} />
      <div className="px-4 sm:px-8 pb-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryFilter label={t('orders.filterPlatform')} options={platformOptions} selected={platformFilter} onChange={setPlatformFilter} t={t} />
          <CategoryFilter label={t('orders.filterStatus')} options={statusOptions} selected={statusFilter} onChange={setStatusFilter} t={t} />
          <CategoryFilter label={t('orders.filterProduct')} options={productOptions} selected={productFilter} onChange={setProductFilter} t={t} />
          {filtersActive && (
            <button onClick={clearAllFilters} className="flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1.5 rounded-lg" style={{ background: CREAM, color: MUTED }}>
              <X size={11} /> {t('orders.clearFilters')}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <OrderDatePicker orders={orders} value={dateFilter} onChange={setDateFilter} t={t} />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1.5 rounded-lg" style={{ background: CREAM, color: MUTED }}>
              <X size={11} /> {t('orders.clearDate')}
            </button>
          )}
        </div>
      </div>
      {unlinkedPlatforms.length > 0 && (
        <div className="mx-4 sm:mx-8 mb-3 rounded-lg px-4 py-2.5 text-[12.5px]" style={{ background: '#F6EBD8', color: '#7A5613' }}>
          {t('orders.notConnected')}: {unlinkedPlatforms.map((p) => p.name).join(', ')} — {t('orders.notShown')}
        </div>
      )}
      <div className="px-4 sm:px-8 pb-8">
        <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="overflow-x-auto">
            <div className="grid px-4 py-2.5 text-[11px] font-semibold gap-2" style={{ color: MUTED, borderBottom: `1px solid ${BORDER}`, gridTemplateColumns: ORDERS_GRID_COLS }}>
              <SortHeader label="Timestamp" sortKey="timestamp" activeKey={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHeader label={t('products.colPlatform')} sortKey="platform" activeKey={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHeader label="Order No." sortKey="orderNo" activeKey={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHeader label="Customer" sortKey="customer" activeKey={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHeader label="Product" sortKey="product" activeKey={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHeader label="Amount" sortKey="amount" activeKey={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHeader label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onClick={toggleSort} />
            </div>
            {sorted.length === 0 && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: '#9AA6C0' }}>{dateFilter || filtersActive ? t('orders.emptyDate') : t('orders.empty')}</div>
            )}
            {sorted.map((o, i) => {
              const meta = STATUS_COLORS[o.status];
              const p = PLATFORMS.find((pl) => pl.id === o.platform)!;
              return (
                <div key={o.id} className="grid px-4 py-3 text-[12.5px] items-center gap-2" style={{ borderBottom: i < sorted.length - 1 ? '1px solid #F0EDE6' : 'none', gridTemplateColumns: ORDERS_GRID_COLS }}>
                  <div className="truncate" style={{ color: MUTED }}>{formatTs(o.timestamp)}</div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </div>
                  <div className="font-medium truncate" style={{ color: INK }}>{o.orderNo}</div>
                  <div className="truncate" style={{ color: INK }}>{o.customer}</div>
                  <div className="truncate" style={{ color: INK }} title={o.product}>{o.product}</div>
                  <div className="font-medium truncate" style={{ color: INK }}>RM {o.amount.toFixed(2)}</div>
                  <div className="truncate">
                    <span className="text-[10.5px] font-bold px-2 py-1 rounded-full whitespace-nowrap" style={{ background: meta.bg, color: meta.fg }}>{t(`status.${o.status}`)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

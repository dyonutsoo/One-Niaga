// SnowUI-inspired dashboard tokens used by the app's inline styles.

export const NAVY = '#17181A';
export const NAVY_LIGHT = '#F3F5F8';
export const CORAL = '#8BA6FF';
export const CREAM = '#F6F8FB';
export const INK = '#1F2328';
export const GREEN = '#2E7D5B';
export const AMBER = '#B8791A';
export const MUTED = '#5A5F6B';
export const BORDER = '#EDF0F5';

export const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  awaiting: { fg: '#506CC7', bg: '#EEF2FB' },
  in_progress: { fg: AMBER, bg: '#FFF4DE' },
  delivered: { fg: GREEN, bg: '#E3EFE9' },
};

// Fixed pixel widths (not fr fractions) so no column can be crushed on narrow
// screens — the row just becomes wider than the viewport and scrolls instead.
export const ORDERS_GRID_COLS = '140px 130px 110px 140px 170px 100px 150px';
export const PRODUCT_ROW_GRID_COLS = '120px 90px 110px 130px 90px 160px';

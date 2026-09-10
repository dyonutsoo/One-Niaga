// Reference-inspired dashboard tokens used by the app's inline styles.

export const NAVY = '#0A0E1D';
export const NAVY_LIGHT = '#F3F1ED';
export const CORAL = '#FB725D';
export const CREAM = '#F3F1ED';
export const INK = '#090B18';
export const GREEN = '#2E7D5B';
export const AMBER = '#B8791A';
export const MUTED = '#85847E';
export const BORDER = 'rgba(10, 14, 29, 0.08)';

export const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  awaiting: { fg: '#B23D45', bg: '#FFE1E0' },
  in_progress: { fg: AMBER, bg: '#FFF4DE' },
  delivered: { fg: GREEN, bg: '#E3EFE9' },
};

// Fixed pixel widths (not fr fractions) so no column can be crushed on narrow
// screens — the row just becomes wider than the viewport and scrolls instead.
export const ORDERS_GRID_COLS = '140px 130px 110px 140px 170px 100px 150px';
export const PRODUCT_ROW_GRID_COLS = '120px 90px 110px 130px 90px 160px';

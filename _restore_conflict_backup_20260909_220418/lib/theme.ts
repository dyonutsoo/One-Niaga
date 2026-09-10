// Brand tokens ported from the original OneNiaga prototype (Desktop/OneNiaga/index.html).
// Components use these directly via inline style, matching the prototype's authoring style.

export const NAVY = '#1B2A4A';
export const NAVY_LIGHT = '#26375C';
export const CORAL = '#E8552F';
export const CREAM = '#F7F8FA';
export const INK = '#1F2328';
export const GREEN = '#2E7D5B';
export const AMBER = '#B8791A';
export const MUTED = '#5A5F6B';
export const BORDER = '#E5E7EB';

export const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  awaiting: { fg: CORAL, bg: '#FBE4DB' },
  in_progress: { fg: AMBER, bg: '#F6EBD8' },
  delivered: { fg: GREEN, bg: '#E3EFE9' },
};

// Fixed pixel widths (not fr fractions) so no column can be crushed on narrow
// screens — the row just becomes wider than the viewport and scrolls instead.
export const ORDERS_GRID_COLS = '140px 130px 110px 140px 170px 100px 150px';
export const PRODUCT_ROW_GRID_COLS = '120px 90px 110px 130px 90px 160px';


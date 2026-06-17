/**
 * 7-component shipping cost color ramp — matches the design-token values in
 * src/styles/tokens.css exactly so bar segments align with the rest of the UI.
 * Ordering mirrors the CostBreakdown shape in src/lib/api/types.ts.
 */
export const COST_COLORS = [
  'var(--color-cost-1)', // baseRate / linehaul
  'var(--color-cost-2)', // fuelSurcharge
  'var(--color-cost-3)', // residentialSurcharge
  'var(--color-cost-4)', // accessorialFees
  'var(--color-cost-5)', // peakSurcharge
  'var(--color-cost-6)', // deliveryAreaSurcharge
  'var(--color-cost-7)', // other
] as const

/** Keys of CostBreakdown in display order (excluding total) */
export const COST_BREAKDOWN_KEYS = [
  'baseRate',
  'fuelSurcharge',
  'residentialSurcharge',
  'accessorialFees',
  'peakSurcharge',
  'deliveryAreaSurcharge',
  'other',
] as const

export type CostBreakdownKey = typeof COST_BREAKDOWN_KEYS[number]

export const COST_KEY_LABELS: Record<CostBreakdownKey, string> = {
  baseRate: 'Base Rate',
  fuelSurcharge: 'Fuel Surcharge',
  residentialSurcharge: 'Residential',
  accessorialFees: 'Accessorials',
  peakSurcharge: 'Peak / Oversize',
  deliveryAreaSurcharge: 'Delivery Area',
  other: 'Other',
}

export const COST_KEY_COLOR: Record<CostBreakdownKey, string> = Object.fromEntries(
  COST_BREAKDOWN_KEYS.map((key, i) => [key, COST_COLORS[i]])
) as Record<CostBreakdownKey, string>

/** Fallback categorical palette for non-cost series */
export const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
] as const

export const POSITIVE_COLOR = 'var(--color-success)'
export const NEGATIVE_COLOR = 'var(--color-danger)'
export const NEUTRAL_COLOR  = '#64748b' // slate-500
export const CONNECTOR_COLOR = '#2a2a36' // --color-border

export function colorForIndex(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

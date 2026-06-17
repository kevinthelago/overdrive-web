/** Categorical palette for cost segments and series */
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
] as const

export const POSITIVE_COLOR = '#10b981' // emerald-500 — cost reductions / gains
export const NEGATIVE_COLOR = '#ef4444' // red-500  — cost additions
export const NEUTRAL_COLOR  = '#6b7280' // gray-500  — totals / baselines
export const CONNECTOR_COLOR = '#d1d5db' // gray-300

export function colorForIndex(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

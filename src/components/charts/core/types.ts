export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Dimensions {
  width: number
  height: number
  boundedWidth: number
  boundedHeight: number
  margin: Margin
}

export const DEFAULT_MARGIN: Margin = {
  top: 24,
  right: 24,
  bottom: 40,
  left: 60,
}

export interface ChartDataPoint {
  label: string
  value: number
  [key: string]: unknown
}

export interface StackedDataPoint {
  label: string
  segments: Record<string, number>
}

export type AccessorFn<D, V> = (d: D) => V

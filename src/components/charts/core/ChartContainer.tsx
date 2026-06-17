import type { ReactNode } from 'react'
import { useChartDimensions } from './useChartDimensions'
import type { Margin } from './types'
import { DEFAULT_MARGIN } from './types'

interface ChartContainerProps {
  height: number | string
  margin?: Margin
  children: (width: number, height: number, boundedWidth: number, boundedHeight: number) => ReactNode
  className?: string
}

/**
 * Responsive SVG wrapper. Observes container width via ResizeObserver and
 * passes bounded dimensions to children via a render-prop.
 */
export function ChartContainer({
  height,
  margin = DEFAULT_MARGIN,
  children,
  className = '',
}: ChartContainerProps) {
  const [ref, dims] = useChartDimensions(margin)

  return (
    <div
      ref={ref}
      className={`w-full overflow-hidden ${className}`}
      style={{ height }}
    >
      {dims.width > 0 && (
        <svg width={dims.width} height={dims.height} aria-hidden="true">
          <g transform={`translate(${dims.margin.left},${dims.margin.top})`}>
            {children(dims.width, dims.height, dims.boundedWidth, dims.boundedHeight)}
          </g>
        </svg>
      )}
    </div>
  )
}

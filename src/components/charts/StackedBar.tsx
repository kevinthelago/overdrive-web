import { useRef } from 'react'
import * as d3 from 'd3'
import {
  ChartContainer,
  AxisBottom,
  AxisLeft,
  Tooltip,
  useTooltip,
  colorForIndex,
  formatCompactUsd,
  formatUsd,
} from './core'

export interface StackedBarSeries {
  /** Unique segment key (e.g. "lineHaul", "fuelSurcharge") */
  key: string
  /** Human-readable display name */
  label: string
}

export interface StackedBarDatum {
  /** X-axis label (e.g. route name or carrier) */
  category: string
  /** Segment values keyed by series.key */
  values: Record<string, number>
}

interface StackedBarProps {
  series: StackedBarSeries[]
  data: StackedBarDatum[]
  height?: number
  yLabel?: string
  className?: string
  /** Show legend below chart */
  showLegend?: boolean
}

/**
 * Stacked bar chart for comparing cost-component breakdowns across
 * multiple routes, carriers, or scenarios.
 */
export function StackedBar({
  series,
  data,
  height = 300,
  yLabel = 'Cost (USD)',
  className,
  showLegend = true,
}: StackedBarProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { tooltip, show, hide } = useTooltip()

  const keys = series.map((s) => s.key)

  const stackGen = d3.stack<StackedBarDatum>().keys(keys).value((d, k) => d.values[k] ?? 0)

  const stacked = stackGen(data)

  const yMax = d3.max(data, (d) => keys.reduce((sum, k) => sum + (d.values[k] ?? 0), 0)) ?? 0

  return (
    <div className={className}>
      <ChartContainer
        height={height}
        margin={{ top: 20, right: 16, bottom: 48, left: 70 }}
      >
        {(_w, _h, bw, bh) => {
          const xScale = d3
            .scaleBand()
            .domain(data.map((d) => d.category))
            .range([0, bw])
            .padding(0.2)

          const yScale = d3
            .scaleLinear()
            .domain([0, yMax * 1.08])
            .nice()
            .range([bh, 0])

          return (
            <>
              <AxisLeft
                scale={yScale}
                tickCount={6}
                tickFormat={(d) => formatCompactUsd(d as number)}
                label={yLabel}
                height={bh}
              />
              <AxisBottom scale={xScale} height={bh} width={bw} />

              {stacked.map((layer, si) => {
                const fill = colorForIndex(si)
                const seriesLabel = series[si]?.label ?? layer.key
                return layer.map((d, di) => {
                  const x = xScale(d.data.category) ?? 0
                  const y0 = yScale(d[1])
                  const y1 = yScale(d[0])
                  const segH = Math.max(y1 - y0, 0)
                  const value = d[1] - d[0]
                  return (
                    <rect
                      key={`${layer.key}-${di}`}
                      x={x}
                      y={y0}
                      width={xScale.bandwidth()}
                      height={segH}
                      fill={fill}
                      fillOpacity={0.85}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const el = (e.target as SVGElement).ownerSVGElement
                        const rect = el?.getBoundingClientRect()
                        show(
                          e.clientX - (rect?.left ?? 0),
                          e.clientY - (rect?.top ?? 0),
                          <span>
                            <strong className="block">{d.data.category}</strong>
                            <span className="text-gray-500">{seriesLabel}: </span>
                            {formatUsd(value)}
                          </span>,
                        )
                      }}
                      onMouseLeave={hide}
                    />
                  )
                })
              })}
            </>
          )
        }}
      </ChartContainer>

      {showLegend && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-[70px] text-xs text-gray-600">
          {series.map((s, i) => (
            <span key={s.key} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: colorForIndex(i) }}
              />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <Tooltip state={tooltip} containerRef={svgRef} />
    </div>
  )
}

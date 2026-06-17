import { useRef } from 'react'
import * as d3 from 'd3'
import {
  ChartContainer,
  AxisBottom,
  AxisLeft,
  Tooltip,
  useTooltip,
  POSITIVE_COLOR,
  NEGATIVE_COLOR,
  NEUTRAL_COLOR,
  CONNECTOR_COLOR,
  formatCompactUsd,
  formatUsd,
} from './core'

export interface WaterfallStep {
  /** Display label for this bar */
  label: string
  /** Absolute dollar amount for total bars; signed delta for intermediate bars */
  value: number
  /**
   * 'total'  — renders a full bar from zero (e.g. start / end totals)
   * 'delta'  — renders a floating bar showing a change from the previous running total
   */
  kind: 'total' | 'delta'
}

interface Bar {
  label: string
  start: number
  end: number
  kind: 'total' | 'delta'
}

interface WaterfallProps {
  steps: WaterfallStep[]
  height?: number
  /** Optional currency label for y-axis */
  currencyLabel?: string
  className?: string
}

function buildBars(steps: WaterfallStep[]): Bar[] {
  let running = 0
  return steps.map((step) => {
    if (step.kind === 'total') {
      const bar: Bar = { label: step.label, start: 0, end: step.value, kind: 'total' }
      running = step.value
      return bar
    }
    const start = running
    const end = running + step.value
    running = end
    return { label: step.label, start, end, kind: 'delta' }
  })
}

/**
 * Waterfall chart for visualising how cost components add up to a total.
 * Suitable for freight cost build-ups and route opportunity comparisons.
 */
export function Waterfall({
  steps,
  height = 280,
  currencyLabel = 'Cost (USD)',
  className,
}: WaterfallProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { tooltip, show, hide } = useTooltip()

  const bars = buildBars(steps)

  return (
    <>
      <ChartContainer
        height={height}
        margin={{ top: 20, right: 16, bottom: 48, left: 70 }}
        className={className}
      >
        {(_w, _h, bw, bh) => {
          const allValues = bars.flatMap((b) => [b.start, b.end])
          const yMin = Math.min(0, ...allValues)
          const yMax = Math.max(...allValues)
          const yPad = (yMax - yMin) * 0.08

          const xScale = d3
            .scaleBand()
            .domain(bars.map((b) => b.label))
            .range([0, bw])
            .padding(0.25)

          const yScale = d3
            .scaleLinear()
            .domain([yMin - yPad, yMax + yPad])
            .nice()
            .range([bh, 0])

          const barWidth = xScale.bandwidth()

          return (
            <>
              <AxisLeft
                scale={yScale}
                tickCount={6}
                tickFormat={(d) => formatCompactUsd(d as number)}
                label={currencyLabel}
                height={bh}
              />
              <AxisBottom scale={xScale} height={bh} width={bw} />

              {/* Zero line */}
              {yMin < 0 && (
                <line
                  x1={0}
                  x2={bw}
                  y1={yScale(0)}
                  y2={yScale(0)}
                  stroke="#6b7280"
                  strokeDasharray="4,2"
                  strokeWidth={1}
                />
              )}

              {/* Connector lines between bars */}
              {bars.slice(0, -1).map((bar, i) => {
                const nextBar = bars[i + 1]
                const x1 = (xScale(bar.label) ?? 0) + barWidth
                const x2 = xScale(nextBar.label) ?? 0
                const y = yScale(bar.end)
                return (
                  <line
                    key={`conn-${i}`}
                    x1={x1}
                    x2={x2}
                    y1={y}
                    y2={y}
                    stroke={CONNECTOR_COLOR}
                    strokeWidth={1}
                    strokeDasharray="3,2"
                  />
                )
              })}

              {/* Bars */}
              {bars.map((bar) => {
                const x = xScale(bar.label) ?? 0
                const top = yScale(Math.max(bar.start, bar.end))
                const barH = Math.abs(yScale(bar.start) - yScale(bar.end))
                const delta = bar.end - bar.start
                const fill =
                  bar.kind === 'total'
                    ? NEUTRAL_COLOR
                    : delta >= 0
                      ? NEGATIVE_COLOR
                      : POSITIVE_COLOR

                return (
                  <rect
                    key={bar.label}
                    x={x}
                    y={top}
                    width={barWidth}
                    height={Math.max(barH, 1)}
                    fill={fill}
                    fillOpacity={0.85}
                    rx={2}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      const svgEl = (e.target as SVGElement).ownerSVGElement
                      const rect = svgEl?.getBoundingClientRect()
                      show(
                        e.clientX - (rect?.left ?? 0),
                        e.clientY - (rect?.top ?? 0),
                        <span>
                          <strong className="block">{bar.label}</strong>
                          {bar.kind === 'total'
                            ? formatUsd(bar.end)
                            : `${delta >= 0 ? '+' : ''}${formatUsd(delta)}`}
                        </span>,
                      )
                    }}
                    onMouseLeave={hide}
                  />
                )
              })}

              {/* Value labels on bars */}
              {bars.map((bar) => {
                const x = (xScale(bar.label) ?? 0) + barWidth / 2
                const delta = bar.end - bar.start
                const top = yScale(Math.max(bar.start, bar.end))
                return (
                  <text
                    key={`label-${bar.label}`}
                    x={x}
                    y={top - 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#374151"
                    pointerEvents="none"
                  >
                    {bar.kind === 'total'
                      ? formatCompactUsd(bar.end)
                      : `${delta >= 0 ? '+' : ''}${formatCompactUsd(delta)}`}
                  </text>
                )
              })}
            </>
          )
        }}
      </ChartContainer>
      <Tooltip state={tooltip} containerRef={svgRef} />
    </>
  )
}

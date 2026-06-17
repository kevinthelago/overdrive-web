import * as d3 from 'd3'
import {
  ChartContainer,
  AxisBottom,
  AxisLeft,
  useTooltip,
  Tooltip,
  POSITIVE_COLOR,
  NEGATIVE_COLOR,
  NEUTRAL_COLOR,
  CONNECTOR_COLOR,
  COST_KEY_COLOR,
  COST_KEY_LABELS,
  COST_BREAKDOWN_KEYS,
  formatCompactUsd,
} from './core'
import type { CostBreakdownKey } from './core'
import type { CostBreakdown, Money } from '@/lib/api/types'

// ── Public types ─────────────────────────────────────────────────────────────

export interface WaterfallStep {
  key: CostBreakdownKey | 'total'
  label: string
  value: number
  kind: 'total' | 'delta'
}

interface Bar extends WaterfallStep {
  start: number
  end: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a CostBreakdown (with Money values) into ordered waterfall steps */
export function breakdownToSteps(breakdown: CostBreakdown): WaterfallStep[] {
  const steps: WaterfallStep[] = []
  let running = 0

  for (const key of COST_BREAKDOWN_KEYS) {
    const val = (breakdown[key] as Money).amount
    if (val === 0) continue
    if (steps.length === 0) {
      steps.push({ key, label: COST_KEY_LABELS[key], value: val, kind: 'total' })
    } else {
      steps.push({ key, label: COST_KEY_LABELS[key], value: val, kind: 'delta' })
    }
    running += val
  }

  steps.push({ key: 'total', label: 'Total', value: running, kind: 'total' })
  return steps
}

function buildBars(steps: WaterfallStep[]): Bar[] {
  let running = 0
  return steps.map((step) => {
    if (step.kind === 'total') {
      const bar: Bar = { ...step, start: 0, end: step.value }
      running = step.value
      return bar
    }
    const start = running
    const end = running + step.value
    running = end
    return { ...step, start, end }
  })
}

function barFill(bar: Bar): string {
  if (bar.kind === 'total') return NEUTRAL_COLOR
  const key = bar.key as CostBreakdownKey
  return COST_KEY_COLOR[key] ?? (bar.end - bar.start >= 0 ? NEGATIVE_COLOR : POSITIVE_COLOR)
}

// ── Component ─────────────────────────────────────────────────────────────────

interface WaterfallProps {
  steps: WaterfallStep[]
  height?: number
  className?: string
}

/**
 * Waterfall chart showing how freight cost components build to a total.
 * Uses the shared 7-component cost color ramp from design tokens.
 */
export function Waterfall({ steps, height = 260, className }: WaterfallProps) {
  const { tooltip, show, hide } = useTooltip()
  const bars = buildBars(steps)

  return (
    <>
      <ChartContainer
        height={height}
        margin={{ top: 20, right: 12, bottom: 48, left: 64 }}
        className={className}
      >
        {(_w, _h, bw, bh) => {
          const allValues = bars.flatMap((b) => [b.start, b.end])
          const yMin = Math.min(0, ...allValues)
          const yMax = Math.max(...allValues)
          const yPad = (yMax - yMin) * 0.1

          const xScale = d3
            .scaleBand()
            .domain(bars.map((b) => b.label))
            .range([0, bw])
            .padding(0.28)

          const yScale = d3
            .scaleLinear()
            .domain([yMin - yPad, yMax + yPad])
            .nice()
            .range([bh, 0])

          const bw2 = xScale.bandwidth()

          return (
            <>
              <AxisLeft
                scale={yScale as d3.AxisScale<d3.AxisDomain>}
                tickCount={5}
                tickFormat={(d) => formatCompactUsd(d as number)}
                height={bh}
              />
              <AxisBottom scale={xScale as d3.AxisScale<d3.AxisDomain>} height={bh} width={bw} />

              {yMin < 0 && (
                <line
                  x1={0} x2={bw}
                  y1={yScale(0)} y2={yScale(0)}
                  stroke={CONNECTOR_COLOR} strokeWidth={1}
                />
              )}

              {/* Connector lines */}
              {bars.slice(0, -1).map((bar, i) => {
                const next = bars[i + 1]
                const x1 = (xScale(bar.label) ?? 0) + bw2
                const x2 = xScale(next.label) ?? 0
                const y = yScale(bar.end)
                return (
                  <line
                    key={`conn-${i}`}
                    x1={x1} x2={x2} y1={y} y2={y}
                    stroke={CONNECTOR_COLOR} strokeWidth={1} strokeDasharray="3,2"
                  />
                )
              })}

              {bars.map((bar) => {
                const x = xScale(bar.label) ?? 0
                const top = yScale(Math.max(bar.start, bar.end))
                const barH = Math.abs(yScale(bar.start) - yScale(bar.end))
                const delta = bar.end - bar.start
                const sign = delta >= 0 ? '+' : ''
                const label = bar.kind === 'total'
                  ? formatCompactUsd(bar.end)
                  : `${sign}${formatCompactUsd(delta)}`

                return (
                  <g key={bar.key}>
                    <rect
                      x={x} y={top}
                      width={bw2} height={Math.max(barH, 1)}
                      fill={barFill(bar)} fillOpacity={0.9} rx={2}
                      style={{ cursor: 'default' }}
                      onMouseEnter={(e) => {
                        const svg = (e.target as SVGElement).ownerSVGElement
                        const r = svg?.getBoundingClientRect()
                        show(
                          e.clientX - (r?.left ?? 0),
                          e.clientY - (r?.top ?? 0),
                          <span>
                            <strong className="block text-text-primary">{bar.label}</strong>
                            <span className="font-mono text-text-secondary">{label}</span>
                          </span>,
                        )
                      }}
                      onMouseLeave={hide}
                    />
                    <text
                      x={x + bw2 / 2} y={top - 4}
                      textAnchor="middle" fontSize={10}
                      fill="var(--color-text-secondary)"
                      pointerEvents="none"
                    >
                      {label}
                    </text>
                  </g>
                )
              })}
            </>
          )
        }}
      </ChartContainer>
      <Tooltip state={tooltip} containerRef={{ current: null }} />
    </>
  )
}

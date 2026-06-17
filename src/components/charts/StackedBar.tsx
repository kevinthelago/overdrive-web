import * as d3 from 'd3'
import {
  ChartContainer,
  AxisBottom,
  AxisLeft,
  useTooltip,
  Tooltip,
  COST_KEY_COLOR,
  COST_KEY_LABELS,
  COST_BREAKDOWN_KEYS,
  formatCompactUsd,
} from './core'
import type { CostBreakdownKey } from './core'
import type { CostBreakdown, Money } from '@/lib/api/types'

// ── Public types ─────────────────────────────────────────────────────────────

export interface StackedBarDatum {
  category: string
  breakdown: CostBreakdown
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function costValues(bd: CostBreakdown): Record<string, number> {
  return Object.fromEntries(
    COST_BREAKDOWN_KEYS.map((k) => [k, (bd[k] as Money).amount]),
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface StackedBarProps {
  data: StackedBarDatum[]
  height?: number
  className?: string
  showLegend?: boolean
}

/**
 * Stacked bar chart comparing cost-component breakdowns across candidates.
 * Segment colors match the 7-component cost color ramp from design tokens.
 */
export function StackedBar({ data, height = 280, className, showLegend = true }: StackedBarProps) {
  const { tooltip, show, hide } = useTooltip()

  const flat = data.map((d) => ({ category: d.category, values: costValues(d.breakdown) }))

  const stackGen = d3
    .stack<(typeof flat)[number]>()
    .keys([...COST_BREAKDOWN_KEYS])
    .value((d, k) => d.values[k] ?? 0)

  const stacked = stackGen(flat)

  const yMax =
    d3.max(flat, (d) =>
      COST_BREAKDOWN_KEYS.reduce((sum, k) => sum + (d.values[k] ?? 0), 0),
    ) ?? 0

  return (
    <div className={className}>
      <ChartContainer
        height={height}
        margin={{ top: 16, right: 12, bottom: 48, left: 64 }}
      >
        {(_w, _h, bw, bh) => {
          const xScale = d3
            .scaleBand()
            .domain(flat.map((d) => d.category))
            .range([0, bw])
            .padding(0.2)

          const yScale = d3
            .scaleLinear()
            .domain([0, yMax * 1.1])
            .nice()
            .range([bh, 0])

          return (
            <>
              <AxisLeft
                scale={yScale as d3.AxisScale<d3.AxisDomain>}
                tickCount={5}
                tickFormat={(d) => formatCompactUsd(d as number)}
                height={bh}
              />
              <AxisBottom scale={xScale as d3.AxisScale<d3.AxisDomain>} height={bh} width={bw} />

              {stacked.map((layer) => {
                const key = layer.key as CostBreakdownKey
                const fill = COST_KEY_COLOR[key] ?? '#64748b'
                const label = COST_KEY_LABELS[key] ?? key

                return layer.map((d, di) => {
                  const x = xScale(d.data.category) ?? 0
                  const y0 = yScale(d[1])
                  const y1 = yScale(d[0])
                  const segH = Math.max(y1 - y0, 0)
                  const value = d[1] - d[0]

                  return (
                    <rect
                      key={`${layer.key}-${di}`}
                      x={x} y={y0}
                      width={xScale.bandwidth()} height={segH}
                      fill={fill} fillOpacity={0.9}
                      style={{ cursor: 'default' }}
                      onMouseEnter={(e) => {
                        const svg = (e.target as SVGElement).ownerSVGElement
                        const r = svg?.getBoundingClientRect()
                        show(
                          e.clientX - (r?.left ?? 0),
                          e.clientY - (r?.top ?? 0),
                          <span>
                            <strong className="block text-text-primary">{d.data.category}</strong>
                            <span className="text-text-secondary">{label}: </span>
                            <span className="font-mono">{formatCompactUsd(value)}</span>
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
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-16 text-xs text-text-secondary">
          {COST_BREAKDOWN_KEYS.map((key) => (
            <span key={key} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: COST_KEY_COLOR[key] }}
              />
              {COST_KEY_LABELS[key]}
            </span>
          ))}
        </div>
      )}

      <Tooltip state={tooltip} containerRef={{ current: null }} />
    </div>
  )
}

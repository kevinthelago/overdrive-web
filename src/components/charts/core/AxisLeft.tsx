import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface AxisLeftProps {
  scale: d3.AxisScale<d3.AxisDomain>
  tickCount?: number
  tickFormat?: (d: d3.AxisDomain) => string
  label?: string
  height?: number
}

export function AxisLeft({
  scale,
  tickCount = 5,
  tickFormat,
  label,
  height,
}: AxisLeftProps) {
  const ref = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const axis = d3.axisLeft(scale).ticks(tickCount)
    if (tickFormat) axis.tickFormat(tickFormat as unknown as (d: d3.AxisDomain, i: number) => string)
    d3.select(ref.current)
      .call(axis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g.selectAll('.tick line')
          .attr('stroke', '#e5e7eb')
          .attr('stroke-dasharray', '2,2'),
      )
      .call((g) => g.selectAll('.tick text').attr('fill', '#6b7280').attr('font-size', 11))
  }, [scale, tickCount, tickFormat])

  return (
    <g>
      <g ref={ref} />
      {label && (
        <text
          transform={`rotate(-90)`}
          x={height ? -height / 2 : 0}
          y={-44}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={11}
        >
          {label}
        </text>
      )}
    </g>
  )
}

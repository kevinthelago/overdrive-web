import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface AxisBottomProps {
  scale: d3.AxisScale<d3.AxisDomain>
  height: number
  tickCount?: number
  tickFormat?: (d: d3.AxisDomain) => string
  label?: string
  width?: number
}

export function AxisBottom({
  scale,
  height,
  tickCount = 5,
  tickFormat,
  label,
  width,
}: AxisBottomProps) {
  const ref = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const axis = d3.axisBottom(scale).ticks(tickCount)
    if (tickFormat) axis.tickFormat(tickFormat as Parameters<typeof axis.tickFormat>[0])
    d3.select(ref.current)
      .call(axis)
      .call((g) => g.select('.domain').attr('stroke', '#d1d5db'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#e5e7eb'))
      .call((g) => g.selectAll('.tick text').attr('fill', '#6b7280').attr('font-size', 11))
  }, [scale, tickCount, tickFormat])

  return (
    <g transform={`translate(0,${height})`}>
      <g ref={ref} />
      {label && (
        <text
          x={width ? width / 2 : 0}
          y={36}
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

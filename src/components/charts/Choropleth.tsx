import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import { FIPS_TO_ABBR, FIPS_TO_NAME } from './fips'

export type ChoroplethDatum = {
  /** Two-letter FIPS-derived state code, e.g. "CA" or a numeric FIPS "06". */
  stateCode: string
  value: number
}

type TooltipState = {
  x: number
  y: number
  label: string
  value: string
} | null

type Props = {
  data: ChoroplethDatum[]
  /** Converts a raw value to the label shown in the tooltip. */
  formatValue?: (v: number) => string
  colorScheme?: readonly string[]
  width?: number
  height?: number
  className?: string
}

const DEFAULT_COLORS = d3.schemeBlues[7] as readonly string[]

/**
 * Renders a US state-level choropleth map.
 * Expects `data` keyed by two-letter state abbreviation or 2-digit FIPS code.
 * Topology is fetched once from cdn.jsdelivr.net/npm/us-atlas.
 */
export function Choropleth({
  data,
  formatValue = (v) => v.toFixed(1),
  colorScheme = DEFAULT_COLORS,
  width = 960,
  height = 600,
  className,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const valueByCode = new Map(data.map((d) => [d.stateCode, d.value]))
    const values = data.map((d) => d.value)
    const [min = 0, max = 1] = [Math.min(...values), Math.max(...values)]

    const color = d3
      .scaleQuantize<string>()
      .domain([min, max])
      .range(colorScheme as string[])

    const projection = d3
      .geoAlbersUsa()
      .scale(1300)
      .translate([width / 2, height / 2])

    const path = d3.geoPath().projection(projection)

    // US states + nation topology (us-atlas 3.x format)
    d3.json<Topology>(
      'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
    ).then((us) => {
      if (!us || !svgRef.current) return

      // Build FIPS → state abbreviation lookup from the topology properties
      const statesGeo = topojson.feature(
        us,
        us.objects['states'] as GeometryCollection
      )

      svg
        .append('g')
        .selectAll<SVGPathElement, GeoJSON.Feature>('path')
        .data(statesGeo.features)
        .join('path')
        .attr('d', path as unknown as string)
        .attr('fill', (feature) => {
          const fips = String((feature.id as number)).padStart(2, '0')
          const abbr = FIPS_TO_ABBR[fips] ?? fips
          const value = valueByCode.get(abbr) ?? valueByCode.get(fips)
          return value != null ? color(value) : '#e5e7eb'
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mousemove', (event: MouseEvent, feature) => {
          const fips = String((feature.id as number)).padStart(2, '0')
          const abbr = FIPS_TO_ABBR[fips] ?? fips
          const value = valueByCode.get(abbr) ?? valueByCode.get(fips)
          const [mx, my] = d3.pointer(event, svgRef.current)
          setTooltip({
            x: mx,
            y: my,
            label: FIPS_TO_NAME[fips] ?? abbr,
            value: value != null ? formatValue(value) : 'No data',
          })
        })
        .on('mouseleave', () => setTooltip(null))

      // Nation outline
      svg
        .append('path')
        .datum(topojson.mesh(us, us.objects['states'] as GeometryCollection, (a, b) => a === b))
        .attr('fill', 'none')
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 0.5)
        .attr('d', path as unknown as string)
    })

    // Color legend
    const legendWidth = 200
    const legendHeight = 10
    const legendX = width - legendWidth - 20
    const legendY = height - 40

    const defs = svg.append('defs')
    const linearGrad = defs
      .append('linearGradient')
      .attr('id', 'choropleth-legend-grad')
    colorScheme.forEach((c, i) => {
      linearGrad
        .append('stop')
        .attr('offset', `${(i / (colorScheme.length - 1)) * 100}%`)
        .attr('stop-color', c)
    })

    const legend = svg.append('g').attr('transform', `translate(${legendX},${legendY})`)
    legend
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('rx', 2)
      .attr('fill', 'url(#choropleth-legend-grad)')

    const legendScale = d3.scaleLinear().domain([min, max]).range([0, legendWidth])
    legend
      .append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(
        d3
          .axisBottom(legendScale)
          .ticks(4)
          .tickSize(4)
          .tickFormat((v) => formatValue(v as number))
      )
      .select('.domain')
      .remove()
  }, [data, colorScheme, formatValue, width, height])

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        aria-label="US state choropleth map"
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
        >
          <span className="font-semibold">{tooltip.label}</span>: {tooltip.value}
        </div>
      )}
    </div>
  )
}

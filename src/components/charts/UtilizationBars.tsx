import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import ResponsiveContainer from '@/components/charts/core/ResponsiveContainer';

interface UtilizationBarItem {
  label: string;
  capacity: number;
  used: number;
  utilizationRate: number;
}

interface UtilizationBarsProps {
  data: UtilizationBarItem[];
  showCapacity?: boolean;
}

const MARGIN = { top: 20, right: 80, bottom: 40, left: 160 };

function utilizationColor(rate: number): string {
  if (rate > 0.85) return '#EF4444';
  if (rate >= 0.6) return '#EAB308';
  return '#22C55E';
}

function UtilizationBarsInner({
  data,
  showCapacity = true,
  width,
  height,
}: UtilizationBarsProps & { width: number; height: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const sorted = [...data].sort((a, b) => b.utilizationRate - a.utilizationRate);
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    if (sorted.length === 0) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 13)
        .text('No data');
      return;
    }

    const capacityMax = d3.max(sorted, (d) => d.capacity) ?? 0;

    const xScale = d3.scaleLinear().domain([0, capacityMax]).range([0, innerW]).nice();
    const yScale = d3
      .scaleBand()
      .domain(sorted.map((d) => d.label))
      .range([0, innerH])
      .padding(0.35);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .call((ax) => {
        ax.select('.domain').attr('stroke', '#374151');
        ax.selectAll('line').attr('stroke', '#374151');
        ax.selectAll('text')
          .attr('fill', '#9CA3AF')
          .attr('font-family', "'IBM Plex Mono', monospace")
          .attr('font-size', 11);
      });

    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .call((ax) => {
        ax.select('.domain').remove();
        ax.selectAll('text').attr('fill', '#E5E7EB').attr('font-size', 12).attr('dx', -6);
      });

    const barGroups = g
      .selectAll('g.util-bar')
      .data(sorted)
      .enter()
      .append('g')
      .attr('class', 'util-bar')
      .attr('transform', (d) => `translate(0,${yScale(d.label) ?? 0})`);

    if (showCapacity) {
      barGroups
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', (d) => xScale(d.capacity))
        .attr('height', yScale.bandwidth())
        .attr('fill', '#1F2937')
        .attr('rx', 3);
    }

    barGroups
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', (d) => xScale(d.used))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => utilizationColor(d.utilizationRate))
      .attr('rx', 3);

    barGroups
      .append('text')
      .attr('x', (d) => xScale(d.used) + 6)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', (d) => utilizationColor(d.utilizationRate))
      .attr('font-family', "'IBM Plex Mono', monospace")
      .attr('font-size', 11)
      .text((d) => `${Math.round(d.utilizationRate * 100)}%`);
  }, [data, showCapacity, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      aria-label="Utilization bars chart"
    />
  );
}

export default function UtilizationBars(props: UtilizationBarsProps) {
  return (
    <ResponsiveContainer>
      {({ width, height }) => <UtilizationBarsInner {...props} width={width} height={height} />}
    </ResponsiveContainer>
  );
}

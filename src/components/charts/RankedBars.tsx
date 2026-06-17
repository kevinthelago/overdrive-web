import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import ResponsiveContainer from '@/components/charts/core/ResponsiveContainer';

interface RankedBarItem {
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
}

interface RankedBarsProps {
  data: RankedBarItem[];
  xLabel?: string;
  maxItems?: number;
}

const MARGIN = { top: 20, right: 80, bottom: 40, left: 180 };
const BAR_HEIGHT = 28;
const SUBLABEL_OFFSET = 14;

function RankedBarsInner({
  data,
  xLabel,
  maxItems = 10,
  width,
  height,
}: RankedBarsProps & { width: number; height: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const items = [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems);

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    if (items.length === 0) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 13)
        .text('No data');
      return;
    }

    const labels = items.map((d, i) => `#${i + 1} ${d.label}`);

    const yScale = d3
      .scaleBand()
      .domain(labels)
      .range([0, Math.min(innerH, items.length * (BAR_HEIGHT + 8))])
      .padding(0.3);

    const xMax = d3.max(items, (d) => d.value) ?? 0;
    const xScale = d3.scaleLinear().domain([0, xMax]).range([0, innerW]).nice();

    const defaultColors = d3
      .scaleLinear<string>()
      .domain([0, Math.max(1, items.length - 1)])
      .range(['#6366F1', '#8B5CF6']);

    g.append('g')
      .attr('transform', `translate(0,${yScale.range()[1]})`)
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
        ax.selectAll('text')
          .attr('fill', '#E5E7EB')
          .attr('font-size', 12)
          .attr('dx', -6);
      });

    const barGroups = g
      .selectAll('g.bar-group')
      .data(items)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (_d, i) => `translate(0,${yScale(labels[i]) ?? 0})`);

    barGroups
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', (d) => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d, i) => d.color ?? defaultColors(i))
      .attr('rx', 2);

    barGroups
      .append('text')
      .attr('x', (d) => xScale(d.value) + 6)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', '#9CA3AF')
      .attr('font-family', "'IBM Plex Mono', monospace")
      .attr('font-size', 11)
      .text((d) => d.value.toLocaleString());

    barGroups
      .filter((d) => !!d.sublabel)
      .append('text')
      .attr('x', -6)
      .attr('y', yScale.bandwidth() + SUBLABEL_OFFSET)
      .attr('text-anchor', 'end')
      .attr('fill', '#6B7280')
      .attr('font-size', 10)
      .text((d) => d.sublabel ?? '');

    if (xLabel) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', yScale.range()[1] + 36)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 12)
        .text(xLabel);
    }
  }, [data, xLabel, maxItems, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      aria-label="Ranked bars chart"
    />
  );
}

export default function RankedBars(props: RankedBarsProps) {
  return (
    <ResponsiveContainer>
      {({ width, height }) => <RankedBarsInner {...props} width={width} height={height} />}
    </ResponsiveContainer>
  );
}

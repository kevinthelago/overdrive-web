import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import ResponsiveContainer from '@/components/charts/core/ResponsiveContainer';

interface HistogramBin {
  min: number;
  max: number;
  count: number;
}

interface HistogramProps {
  data: HistogramBin[];
  color?: string;
  xLabel?: string;
  yLabel?: string;
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 60 };

function HistogramInner({
  data,
  color = '#6366F1',
  xLabel,
  yLabel,
  width,
  height,
}: HistogramProps & { width: number; height: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    if (data.length === 0) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 13)
        .text('No data');
      return;
    }

    const xMax = d3.max(data, (d) => d.max) ?? 0;
    const yMax = d3.max(data, (d) => d.count) ?? 0;

    const xScale = d3.scaleLinear().domain([0, xMax]).range([0, innerW]).nice();
    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]).nice();

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .call((ax) => {
        ax.select('.domain').attr('stroke', '#374151');
        ax.selectAll('line').attr('stroke', '#374151');
        ax.selectAll('text')
          .attr('fill', '#9CA3AF')
          .attr('font-family', "'IBM Plex Mono', monospace")
          .attr('font-size', 11);
      });

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call((ax) => {
        ax.select('.domain').attr('stroke', '#374151');
        ax.selectAll('line').attr('stroke', '#374151');
        ax.selectAll('text')
          .attr('fill', '#9CA3AF')
          .attr('font-family', "'IBM Plex Mono', monospace")
          .attr('font-size', 11);
      });

    if (xLabel) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 36)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 12)
        .text(xLabel);
    }

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -48)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 12)
        .text(yLabel);
    }

    g.selectAll('rect.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.min) + 1)
      .attr('y', (d) => yScale(d.count))
      .attr('width', (d) => Math.max(0, (xScale(d.max) - xScale(d.min)) * 0.9 - 2))
      .attr('height', (d) => innerH - yScale(d.count))
      .attr('fill', color)
      .append('title')
      .text((d) => `Range: ${d.min}–${d.max}\nCount: ${d.count}`);
  }, [data, color, xLabel, yLabel, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      aria-label="Histogram chart"
    />
  );
}

export default function Histogram(props: HistogramProps) {
  return (
    <ResponsiveContainer>
      {({ width, height }) => <HistogramInner {...props} width={width} height={height} />}
    </ResponsiveContainer>
  );
}

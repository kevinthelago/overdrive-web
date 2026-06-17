import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import ResponsiveContainer from '@/components/charts/core/ResponsiveContainer';

interface MatrixCell {
  row: string;
  col: string;
  value: number;
  label?: string;
  status?: 'winning' | 'losing' | 'tied' | 'neutral';
}

interface MatrixProps {
  data: MatrixCell[];
  rows: string[];
  cols: string[];
}

const MARGIN = { top: 80, right: 20, bottom: 20, left: 120 };

const STATUS_FILL: Record<string, string> = {
  winning: 'rgba(34,197,94,0.3)',
  losing: 'rgba(239,68,68,0.3)',
  tied: 'rgba(100,116,139,0.3)',
  neutral: '#1F2937',
};

function MatrixInner({
  data,
  rows,
  cols,
  width,
  height,
}: MatrixProps & { width: number; height: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    if (data.length === 0 || rows.length === 0 || cols.length === 0) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 13)
        .text('No data');
      return;
    }

    const xScale = d3.scaleBand().domain(cols).range([0, innerW]).padding(0.05);
    const yScale = d3.scaleBand().domain(rows).range([0, innerH]).padding(0.05);

    g.selectAll('text.col-label')
      .data(cols)
      .enter()
      .append('text')
      .attr('class', 'col-label')
      .attr('x', (d) => (xScale(d) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', -10)
      .attr('text-anchor', 'end')
      .attr('transform', (d) => {
        const cx = (xScale(d) ?? 0) + xScale.bandwidth() / 2;
        return `rotate(-45,${cx},-10)`;
      })
      .attr('fill', '#9CA3AF')
      .attr('font-size', 11)
      .text((d) => d);

    g.selectAll('text.row-label')
      .data(rows)
      .enter()
      .append('text')
      .attr('class', 'row-label')
      .attr('x', -8)
      .attr('y', (d) => (yScale(d) ?? 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#9CA3AF')
      .attr('font-size', 11)
      .text((d) => d);

    const cellData = data.map((d) => ({ ...d, key: `${d.row}__${d.col}` }));

    const cells = g
      .selectAll('g.cell')
      .data(cellData)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d) => `translate(${xScale(d.col) ?? 0},${yScale(d.row) ?? 0})`)
      .style('cursor', 'default')
      .on('mouseenter', (_event, d) => setHoveredKey(d.key))
      .on('mouseleave', () => setHoveredKey(null));

    cells
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => STATUS_FILL[d.status ?? 'neutral'])
      .attr('stroke', (d) => (d.key === hoveredKey ? '#6366F1' : 'transparent'))
      .attr('stroke-width', 2)
      .attr('rx', 2);

    cells
      .append('text')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#E5E7EB')
      .attr('font-family', "'IBM Plex Mono', monospace")
      .attr('font-size', 11)
      .text((d) => d.label ?? d.value.toString());
  }, [data, rows, cols, width, height, hoveredKey]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      aria-label="Matrix chart"
    />
  );
}

export default function Matrix(props: MatrixProps) {
  return (
    <ResponsiveContainer>
      {({ width, height }) => <MatrixInner {...props} width={width} height={height} />}
    </ResponsiveContainer>
  );
}

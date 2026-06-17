import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import ResponsiveContainer from '@/components/charts/core/ResponsiveContainer';

interface FlowNode {
  id: string;
  name: string;
  group: 'origin' | 'mode' | 'carrier' | 'dest';
}

interface FlowLink {
  source: string;
  target: string;
  value: number;
}

interface FreightFlowProps {
  nodes: FlowNode[];
  links: FlowLink[];
  valueLabel?: string;
}

const MARGIN = { top: 30, right: 100, bottom: 20, left: 100 };
const COLUMN_ORDER: FlowNode['group'][] = ['origin', 'mode', 'carrier', 'dest'];
const COLUMN_LABELS: Record<FlowNode['group'], string> = {
  origin: 'Origin',
  mode: 'Mode',
  carrier: 'Carrier',
  dest: 'Destination',
};
const NODE_WIDTH = 12;
const NODE_PADDING = 8;

interface LayoutNode extends FlowNode {
  x: number;
  y0: number;
  y1: number;
  totalValue: number;
}

interface LayoutLink {
  source: LayoutNode;
  target: LayoutNode;
  value: number;
  sourceY0: number;
  targetY0: number;
}

function computeLayout(
  nodes: FlowNode[],
  links: FlowLink[],
  innerW: number,
  innerH: number,
): { layoutNodes: LayoutNode[]; layoutLinks: LayoutLink[] } {
  const colWidth = innerW / (COLUMN_ORDER.length - 1);

  const byGroup = new Map<FlowNode['group'], FlowNode[]>();
  COLUMN_ORDER.forEach((g) => byGroup.set(g, []));
  nodes.forEach((n) => byGroup.get(n.group)?.push(n));

  const nodeTotals = new Map<string, number>();
  links.forEach((l) => {
    nodeTotals.set(l.source, (nodeTotals.get(l.source) ?? 0) + l.value);
    nodeTotals.set(l.target, (nodeTotals.get(l.target) ?? 0) + l.value);
  });

  const layoutNodes: LayoutNode[] = [];
  const nodeById = new Map<string, LayoutNode>();

  COLUMN_ORDER.forEach((group, colIdx) => {
    const groupNodes = byGroup.get(group) ?? [];
    const totalValue = groupNodes.reduce(
      (sum, n) => sum + (nodeTotals.get(n.id) ?? 0),
      0,
    );
    const scale = totalValue > 0 ? (innerH - NODE_PADDING * (groupNodes.length - 1)) / totalValue : 0;

    let currentY = 0;
    groupNodes.forEach((n) => {
      const value = nodeTotals.get(n.id) ?? 0;
      const nodeH = Math.max(4, value * scale);
      const ln: LayoutNode = {
        ...n,
        x: colIdx * colWidth,
        y0: currentY,
        y1: currentY + nodeH,
        totalValue: value,
      };
      layoutNodes.push(ln);
      nodeById.set(n.id, ln);
      currentY += nodeH + NODE_PADDING;
    });
  });

  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();
  layoutNodes.forEach((n) => {
    sourceOffsets.set(n.id, n.y0);
    targetOffsets.set(n.id, n.y0);
  });

  const layoutLinks: LayoutLink[] = [];
  links.forEach((l) => {
    const src = nodeById.get(l.source);
    const tgt = nodeById.get(l.target);
    if (!src || !tgt) return;

    const totalValue = Math.max(
      1,
      layoutNodes
        .filter((n) => n.id === src.id || n.id === tgt.id)
        .reduce((s, n) => s + n.totalValue, 0) / 2,
    );
    const srcH = src.y1 - src.y0;
    const tgtH = tgt.y1 - tgt.y0;
    const srcScale = srcH / Math.max(1, src.totalValue);
    const tgtScale = tgtH / Math.max(1, tgt.totalValue);

    const sY0 = sourceOffsets.get(src.id) ?? src.y0;
    const tY0 = targetOffsets.get(tgt.id) ?? tgt.y0;

    layoutLinks.push({
      source: src,
      target: tgt,
      value: l.value,
      sourceY0: sY0,
      targetY0: tY0,
    });

    sourceOffsets.set(src.id, sY0 + l.value * srcScale);
    targetOffsets.set(tgt.id, tY0 + l.value * tgtScale);
  });

  return { layoutNodes, layoutLinks };
}

function FreightFlowInner({
  nodes,
  links,
  valueLabel = 'shipments',
  width,
  height,
}: FreightFlowProps & { width: number; height: number }) {
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

    if (nodes.length === 0 || links.length === 0) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 13)
        .text('No flow data');
      return;
    }

    const colWidth = innerW / (COLUMN_ORDER.length - 1);

    COLUMN_ORDER.forEach((group, i) => {
      g.append('text')
        .attr('x', i * colWidth + NODE_WIDTH / 2)
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9CA3AF')
        .attr('font-size', 11)
        .text(COLUMN_LABELS[group]);
    });

    const { layoutNodes, layoutLinks } = computeLayout(nodes, links, innerW, innerH);

    layoutLinks.forEach((ll) => {
      const srcX = ll.source.x + NODE_WIDTH;
      const tgtX = ll.target.x;
      const midX = (srcX + tgtX) / 2;

      const srcH = ll.source.y1 - ll.source.y0;
      const tgtH = ll.target.y1 - ll.target.y0;
      const srcScale = srcH / Math.max(1, ll.source.totalValue);
      const tgtScale = tgtH / Math.max(1, ll.target.totalValue);
      const linkH = Math.max(1, ll.value * ((srcScale + tgtScale) / 2));

      g.append('path')
        .attr(
          'd',
          `M${srcX},${ll.sourceY0}
           C${midX},${ll.sourceY0} ${midX},${ll.targetY0} ${tgtX},${ll.targetY0}
           L${tgtX},${ll.targetY0 + linkH}
           C${midX},${ll.targetY0 + linkH} ${midX},${ll.sourceY0 + linkH} ${srcX},${ll.sourceY0 + linkH}
           Z`,
        )
        .attr('fill', 'rgba(99,102,241,0.3)')
        .attr('stroke', 'none');
    });

    layoutNodes.forEach((n) => {
      const isRight = n.group === 'dest';
      g.append('rect')
        .attr('x', n.x)
        .attr('y', n.y0)
        .attr('width', NODE_WIDTH)
        .attr('height', Math.max(4, n.y1 - n.y0))
        .attr('fill', '#4F46E5')
        .attr('rx', 2);

      g.append('text')
        .attr('x', isRight ? n.x + NODE_WIDTH + 6 : n.x - 6)
        .attr('y', (n.y0 + n.y1) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', isRight ? 'start' : 'end')
        .attr('fill', '#D1D5DB')
        .attr('font-size', 11)
        .text(n.name);
    });

    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6B7280')
      .attr('font-size', 11)
      .text(`Flow width proportional to ${valueLabel}`);
  }, [nodes, links, valueLabel, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      aria-label="Freight flow chart"
    />
  );
}

export default function FreightFlow(props: FreightFlowProps) {
  return (
    <ResponsiveContainer>
      {({ width, height }) => <FreightFlowInner {...props} width={width} height={height} />}
    </ResponsiveContainer>
  );
}

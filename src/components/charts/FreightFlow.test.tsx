import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import FreightFlow from './FreightFlow';

vi.mock('@/components/charts/core/ResponsiveContainer', () => ({
  default: ({
    children,
  }: {
    children: (dims: { width: number; height: number }) => React.ReactNode;
  }) => children({ width: 600, height: 400 }),
}));

const SAMPLE_NODES = [
  { id: 'wh-chicago', name: 'Chicago WH', group: 'origin' as const },
  { id: 'wh-dallas', name: 'Dallas WH', group: 'origin' as const },
  { id: 'ground', name: 'Ground', group: 'mode' as const },
  { id: 'air', name: 'Air', group: 'mode' as const },
  { id: 'fedex', name: 'FedEx', group: 'carrier' as const },
  { id: 'ups', name: 'UPS', group: 'carrier' as const },
  { id: 'nyc', name: 'New York, NY', group: 'dest' as const },
  { id: 'la', name: 'Los Angeles, CA', group: 'dest' as const },
];

const SAMPLE_LINKS = [
  { source: 'wh-chicago', target: 'ground', value: 80 },
  { source: 'wh-chicago', target: 'air', value: 20 },
  { source: 'wh-dallas', target: 'ground', value: 60 },
  { source: 'ground', target: 'fedex', value: 90 },
  { source: 'ground', target: 'ups', value: 50 },
  { source: 'air', target: 'fedex', value: 20 },
  { source: 'fedex', target: 'nyc', value: 70 },
  { source: 'fedex', target: 'la', value: 40 },
  { source: 'ups', target: 'nyc', value: 50 },
];

describe('FreightFlow', () => {
  it('renders without crashing', () => {
    render(
      <FreightFlow nodes={SAMPLE_NODES} links={SAMPLE_LINKS} valueLabel="shipments" />,
    );
  });

  it('renders empty state for empty data', () => {
    render(<FreightFlow nodes={[]} links={[]} />);
  });
});

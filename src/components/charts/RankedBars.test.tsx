import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import RankedBars from './RankedBars';

vi.mock('@/components/charts/core/ResponsiveContainer', () => ({
  default: ({
    children,
  }: {
    children: (dims: { width: number; height: number }) => React.ReactNode;
  }) => children({ width: 600, height: 400 }),
}));

const SAMPLE_DATA = [
  { label: 'Chicago', value: 142, sublabel: 'IL', color: '#6366F1' },
  { label: 'Dallas', value: 98 },
  { label: 'Atlanta', value: 76 },
  { label: 'Los Angeles', value: 54, sublabel: 'CA' },
];

describe('RankedBars', () => {
  it('renders without crashing', () => {
    render(<RankedBars data={SAMPLE_DATA} xLabel="Shipments" />);
  });

  it('renders empty state for empty data', () => {
    render(<RankedBars data={[]} />);
  });
});

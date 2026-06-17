import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import Histogram from './Histogram';

vi.mock('@/components/charts/core/ResponsiveContainer', () => ({
  default: ({
    children,
  }: {
    children: (dims: { width: number; height: number }) => React.ReactNode;
  }) => children({ width: 600, height: 400 }),
}));

const SAMPLE_DATA = [
  { min: 0, max: 10, count: 5 },
  { min: 10, max: 20, count: 12 },
  { min: 20, max: 30, count: 8 },
  { min: 30, max: 40, count: 3 },
];

describe('Histogram', () => {
  it('renders without crashing', () => {
    render(<Histogram data={SAMPLE_DATA} xLabel="Cost ($)" yLabel="Shipments" />);
  });

  it('renders empty state for empty data', () => {
    render(<Histogram data={[]} />);
  });
});

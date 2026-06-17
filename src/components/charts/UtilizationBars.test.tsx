import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import UtilizationBars from './UtilizationBars';

vi.mock('@/components/charts/core/ResponsiveContainer', () => ({
  default: ({
    children,
  }: {
    children: (dims: { width: number; height: number }) => React.ReactNode;
  }) => children({ width: 600, height: 400 }),
}));

const SAMPLE_DATA = [
  { label: 'Chicago DC', capacity: 5000, used: 4600, utilizationRate: 0.92 },
  { label: 'Dallas Hub', capacity: 3000, used: 2100, utilizationRate: 0.70 },
  { label: 'Atlanta FC', capacity: 4000, used: 1800, utilizationRate: 0.45 },
];

describe('UtilizationBars', () => {
  it('renders without crashing', () => {
    render(<UtilizationBars data={SAMPLE_DATA} />);
  });

  it('renders without crashing with showCapacity false', () => {
    render(<UtilizationBars data={SAMPLE_DATA} showCapacity={false} />);
  });

  it('renders empty state for empty data', () => {
    render(<UtilizationBars data={[]} />);
  });
});

import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import Matrix from './Matrix';

vi.mock('@/components/charts/core/ResponsiveContainer', () => ({
  default: ({
    children,
  }: {
    children: (dims: { width: number; height: number }) => React.ReactNode;
  }) => children({ width: 600, height: 400 }),
}));

const ROWS = ['Carrier A', 'Carrier B'];
const COLS = ['Region 1', 'Region 2', 'Region 3'];
const SAMPLE_DATA = [
  { row: 'Carrier A', col: 'Region 1', value: 12.3, label: '+12.3%', status: 'winning' as const },
  { row: 'Carrier A', col: 'Region 2', value: -3.1, label: '-3.1%', status: 'losing' as const },
  { row: 'Carrier A', col: 'Region 3', value: 0, label: '0%', status: 'tied' as const },
  { row: 'Carrier B', col: 'Region 1', value: 5.0, label: '+5.0%', status: 'winning' as const },
  { row: 'Carrier B', col: 'Region 2', value: 2.1, status: 'neutral' as const },
  { row: 'Carrier B', col: 'Region 3', value: -1.5, label: '-1.5%', status: 'losing' as const },
];

describe('Matrix', () => {
  it('renders without crashing', () => {
    render(<Matrix data={SAMPLE_DATA} rows={ROWS} cols={COLS} />);
  });

  it('renders empty state for empty data', () => {
    render(<Matrix data={[]} rows={[]} cols={[]} />);
  });
});

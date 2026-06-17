import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityList } from '../../components/EntityList';
import { renderWithProviders } from '../setup';
import type { Page } from '../../types';

vi.mock('../../../components/ui/DataTable', () => ({
  DataTable: ({ data, isLoading, emptyMessage }: { data: unknown[]; isLoading: boolean; emptyMessage: string }) => {
    if (isLoading) return <div>Loading…</div>;
    if (data.length === 0) return <div>{emptyMessage}</div>;
    return <div data-testid="data-table">{data.length} rows</div>;
  },
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

interface Row { id: string; name: string }

const columns = [{ accessorKey: 'name', header: 'Name' }];

const mockPage: Page<Row> = {
  content: [{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 20,
};

describe('EntityList', () => {
  it('renders the title and Add button', () => {
    const onAdd = vi.fn();
    renderWithProviders(
      <EntityList
        title="Widgets"
        columns={columns}
        data={mockPage}
        isLoading={false}
        search=""
        onSearchChange={vi.fn()}
        page={0}
        onPageChange={vi.fn()}
        onAdd={onAdd}
        addLabel="Add Widget"
      />,
    );
    expect(screen.getByText('Widgets')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Widget' })).toBeInTheDocument();
  });

  it('passes data to DataTable and renders rows count', () => {
    renderWithProviders(
      <EntityList
        title="Widgets"
        columns={columns}
        data={mockPage}
        isLoading={false}
        search=""
        onSearchChange={vi.fn()}
        page={0}
        onPageChange={vi.fn()}
        onAdd={vi.fn()}
        addLabel="Add Widget"
      />,
    );
    expect(screen.getByTestId('data-table')).toHaveTextContent('2 rows');
  });

  it('shows loading state', () => {
    renderWithProviders(
      <EntityList
        title="Widgets"
        columns={columns}
        data={undefined}
        isLoading={true}
        search=""
        onSearchChange={vi.fn()}
        page={0}
        onPageChange={vi.fn()}
        onAdd={vi.fn()}
        addLabel="Add Widget"
      />,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    const emptyPage: Page<Row> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
    renderWithProviders(
      <EntityList
        title="Widgets"
        columns={columns}
        data={emptyPage}
        isLoading={false}
        search=""
        onSearchChange={vi.fn()}
        page={0}
        onPageChange={vi.fn()}
        onAdd={vi.fn()}
        addLabel="Add Widget"
      />,
    );
    expect(screen.getByText('No widgets found.')).toBeInTheDocument();
  });

  it('calls onAdd when Add button clicked', async () => {
    const onAdd = vi.fn();
    renderWithProviders(
      <EntityList
        title="Widgets"
        columns={columns}
        data={mockPage}
        isLoading={false}
        search=""
        onSearchChange={vi.fn()}
        page={0}
        onPageChange={vi.fn()}
        onAdd={onAdd}
        addLabel="Add Widget"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add Widget' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('calls onSearchChange when typing in search input', async () => {
    const onSearchChange = vi.fn();
    renderWithProviders(
      <EntityList
        title="Widgets"
        columns={columns}
        data={mockPage}
        isLoading={false}
        search=""
        onSearchChange={onSearchChange}
        page={0}
        onPageChange={vi.fn()}
        onAdd={vi.fn()}
        addLabel="Add Widget"
      />,
    );
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'foo');
    expect(onSearchChange).toHaveBeenCalledWith(expect.stringContaining('f'));
  });

  it('shows pagination controls when totalPages > 1', () => {
    const multiPage: Page<Row> = { ...mockPage, totalPages: 3, totalElements: 60 };
    renderWithProviders(
      <EntityList
        title="Widgets"
        columns={columns}
        data={multiPage}
        isLoading={false}
        search=""
        onSearchChange={vi.fn()}
        page={1}
        onPageChange={vi.fn()}
        onAdd={vi.fn()}
        addLabel="Add Widget"
      />,
    );
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });
});

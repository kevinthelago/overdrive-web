import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductList } from '../../products/ProductList';
import { renderWithProviders } from '../setup';
import type { Page, Product } from '../../types';

vi.mock('../../hooks', () => ({
  useProducts: vi.fn(),
  useDeleteProduct: vi.fn(),
}));

vi.mock('../../products/ProductForm', () => ({
  ProductForm: ({ open, product }: { open: boolean; product: Product | null }) =>
    open ? <div data-testid="product-form">{product ? `Edit: ${product.name}` : 'Add form'}</div> : null,
}));

vi.mock('../../components/DeleteDialog', () => ({
  DeleteDialog: ({ open, entityName }: { open: boolean; entityName: string }) =>
    open ? <div data-testid="delete-dialog">Delete: {entityName}</div> : null,
}));

vi.mock('../../../components/ui/DataTable', () => ({
  DataTable: ({
    data,
    isLoading,
    emptyMessage,
  }: {
    data: Product[];
    isLoading: boolean;
    emptyMessage: string;
    columns: unknown[];
  }) => {
    if (isLoading) return <div>Loading…</div>;
    if (data.length === 0) return <div>{emptyMessage}</div>;
    return (
      <table>
        <tbody>
          {data.map((p) => (
            <tr key={p.id} data-testid={`row-${p.id}`}>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>
                <button onClick={() => {}}>Edit</button>
                <button onClick={() => {}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
}));

vi.mock('../../../components/ui/Pill', () => ({
  Pill: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('../../../components/ui/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('../../../lib/api/client', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(message: string, status: number, body: unknown) {
      super(message);
      this.status = status;
      this.body = body;
    }
  },
}));

import { useProducts, useDeleteProduct } from '../../hooks';

const mockProducts: Product[] = [
  {
    id: 'p-1',
    sku: 'SKU-001',
    name: 'Widget A',
    category: 'STANDARD',
    weightLb: 2.5,
    lengthIn: 10,
    widthIn: 8,
    heightIn: 6,
    active: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'p-2',
    sku: 'SKU-002',
    name: 'Widget B',
    category: 'PERISHABLE',
    weightLb: 5.0,
    lengthIn: 12,
    widthIn: 10,
    heightIn: 8,
    active: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockPage: Page<Product> = {
  content: mockProducts,
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 20,
};

beforeEach(() => {
  vi.mocked(useProducts).mockReturnValue({ data: mockPage, isLoading: false } as ReturnType<typeof useProducts>);
  vi.mocked(useDeleteProduct).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteProduct>);
});

describe('ProductList', () => {
  it('renders product rows', () => {
    renderWithProviders(<ProductList />);
    expect(screen.getByTestId('row-p-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-p-2')).toBeInTheDocument();
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('Widget A')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useProducts).mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useProducts>);
    renderWithProviders(<ProductList />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    const empty: Page<Product> = { ...mockPage, content: [], totalElements: 0 };
    vi.mocked(useProducts).mockReturnValue({ data: empty, isLoading: false } as ReturnType<typeof useProducts>);
    renderWithProviders(<ProductList />);
    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
  });

  it('opens add form when Add Product clicked', async () => {
    renderWithProviders(<ProductList />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Product' }));
    await waitFor(() => expect(screen.getByTestId('product-form')).toHaveTextContent('Add form'));
  });

  it('shows Products heading', () => {
    renderWithProviders(<ProductList />);
    expect(screen.getByText('Products')).toBeInTheDocument();
  });
});

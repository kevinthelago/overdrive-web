import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from '../../products/ProductForm';
import { renderWithProviders } from '../setup';
import type { Product } from '../../types';

vi.mock('../../hooks', () => ({
  useCreateProduct: vi.fn(),
  useUpdateProduct: vi.fn(),
}));

vi.mock('../../components/OptimisticLockDialog', () => ({
  OptimisticLockDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="lock-dialog">Lock conflict</div> : null,
}));

vi.mock('../../../../components/ui/Drawer', () => ({
  Drawer: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DrawerContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DrawerFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../../components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    form,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    form?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} type={(type as 'button' | 'submit') ?? 'button'} form={form}>
      {children}
    </button>
  ),
}));

vi.mock('../../../../components/ui/FormField', () => ({
  FormField: ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <div>
      {label && <label>{label}</label>}
      {children}
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

vi.mock('../../../../components/ui/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('../../../../lib/api/client', () => ({
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

import { useCreateProduct, useUpdateProduct } from '../../hooks';
import { ApiError } from '../../../../lib/api/client';

const mockProduct: Product = {
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
};

function setupMocks(overrides: { createAsync?: () => Promise<unknown>; updateAsync?: () => Promise<unknown> } = {}) {
  vi.mocked(useCreateProduct).mockReturnValue({
    mutateAsync: overrides.createAsync ?? vi.fn().mockResolvedValue(mockProduct),
    isPending: false,
  } as unknown as ReturnType<typeof useCreateProduct>);
  vi.mocked(useUpdateProduct).mockReturnValue({
    mutateAsync: overrides.updateAsync ?? vi.fn().mockResolvedValue(mockProduct),
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProduct>);
}

beforeEach(() => {
  setupMocks();
});

describe('ProductForm', () => {
  it('renders add form when product is null', () => {
    renderWithProviders(<ProductForm open={true} onClose={vi.fn()} product={null} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('renders edit form with pre-filled values', () => {
    renderWithProviders(<ProductForm open={true} onClose={vi.fn()} product={mockProduct} />);
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SKU-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Widget A')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty add form', async () => {
    renderWithProviders(<ProductForm open={true} onClose={vi.fn()} product={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('calls createProduct on valid add submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(mockProduct);
    vi.mocked(useCreateProduct).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateProduct>);

    renderWithProviders(<ProductForm open={true} onClose={vi.fn()} product={null} />);

    await userEvent.type(screen.getByPlaceholderText('e.g. SKU-001'), 'NEW-001');
    await userEvent.type(screen.getByPlaceholderText('Product name'), 'New Widget');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'STANDARD');
    await userEvent.type(screen.getByPlaceholderText('0.00'), '3.5');

    const numberInputs = screen.getAllByRole('spinbutton');
    await userEvent.type(numberInputs[1], '12');
    await userEvent.type(numberInputs[2], '10');
    await userEvent.type(numberInputs[3], '8');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
  });

  it('surfaces server field error inline', async () => {
    const fieldError = new ApiError('Unprocessable', 422, {
      fieldErrors: { sku: 'SKU already exists' },
    });
    vi.mocked(useCreateProduct).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(fieldError),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateProduct>);

    renderWithProviders(<ProductForm open={true} onClose={vi.fn()} product={null} />);

    await userEvent.type(screen.getByPlaceholderText('e.g. SKU-001'), 'DUP-001');
    await userEvent.type(screen.getByPlaceholderText('Product name'), 'Dup Widget');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'STANDARD');
    await userEvent.type(screen.getByPlaceholderText('0.00'), '1');
    const numberInputs = screen.getAllByRole('spinbutton');
    await userEvent.type(numberInputs[1], '5');
    await userEvent.type(numberInputs[2], '5');
    await userEvent.type(numberInputs[3], '5');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('SKU already exists')).toBeInTheDocument());
  });

  it('shows optimistic lock dialog on 409 conflict', async () => {
    const lockError = new ApiError('Conflict', 409, {
      type: 'https://overdrive.local/errors/optimistic-lock-conflict',
    });
    vi.mocked(useUpdateProduct).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(lockError),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateProduct>);

    renderWithProviders(<ProductForm open={true} onClose={vi.fn()} product={mockProduct} />);
    await screen.findByDisplayValue('SKU-001');
    fireEvent.submit(document.getElementById('product-form')!);
    await waitFor(() => expect(screen.getByTestId('lock-dialog')).toBeInTheDocument());
  });

  it('does not render when closed', () => {
    renderWithProviders(<ProductForm open={false} onClose={vi.fn()} product={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

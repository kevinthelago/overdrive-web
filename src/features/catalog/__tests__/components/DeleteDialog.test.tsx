import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteDialog } from '../../components/DeleteDialog';
import { renderWithProviders } from '../setup';

vi.mock('../../../../components/ui/Dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({
    title,
    children,
    footer,
  }: {
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) => (
    <div>
      {title && <h2>{title}</h2>}
      {children}
      {footer}
    </div>
  ),
}));

vi.mock('../../../../components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('../../../../components/ui/Pill', () => ({
  Pill: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe('DeleteDialog', () => {
  it('renders confirm dialog with entity name', () => {
    renderWithProviders(
      <DeleteDialog
        open={true}
        onClose={vi.fn()}
        entityName="FedEx Ground"
        onConfirm={vi.fn()}
        isDeleting={false}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText(/FedEx Ground/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when Delete clicked', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <DeleteDialog
        open={true}
        onClose={vi.fn()}
        entityName="Carrier A"
        onConfirm={onConfirm}
        isDeleting={false}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
  });

  it('calls onClose when Cancel clicked', async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <DeleteDialog
        open={true}
        onClose={onClose}
        entityName="Carrier A"
        onConfirm={vi.fn()}
        isDeleting={false}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables Delete button and shows Deleting text while isDeleting', () => {
    renderWithProviders(
      <DeleteDialog
        open={true}
        onClose={vi.fn()}
        entityName="Carrier A"
        onConfirm={vi.fn()}
        isDeleting={true}
      />,
    );
    expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled();
  });

  it('renders blocked-delete mode when references provided', () => {
    const refs = [
      { type: 'serviceLevel', id: 'sl-1', name: 'FedEx Ground' },
      { type: 'serviceLevel', id: 'sl-2', name: 'FedEx Express' },
    ];
    renderWithProviders(
      <DeleteDialog
        open={true}
        onClose={vi.fn()}
        entityName="FedEx"
        onConfirm={vi.fn()}
        isDeleting={false}
        blockedReferences={refs}
      />,
    );
    expect(screen.getByText('Cannot Delete')).toBeInTheDocument();
    expect(screen.getByText('FedEx Ground')).toBeInTheDocument();
    expect(screen.getByText('FedEx Express')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithProviders(
      <DeleteDialog
        open={false}
        onClose={vi.fn()}
        entityName="X"
        onConfirm={vi.fn()}
        isDeleting={false}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

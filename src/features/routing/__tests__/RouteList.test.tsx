import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoutingInputs } from '../RoutingInputs'
import * as appStore from '@/state/appStore'

vi.mock('@/state/appStore', () => ({
  useAppStore: vi.fn(),
}))

const defaultStore = {
  selectedProductId: 'prod-1',
  destinationZip: '90210',
  setDestinationZip: vi.fn(),
}

describe('RoutingInputs', () => {
  beforeEach(() => {
    vi.mocked(appStore.useAppStore).mockReturnValue(defaultStore as any)
  })

  it('renders service level controls', () => {
    render(<RoutingInputs onSolve={vi.fn()} loading={false} />)
    expect(screen.getByText('Ground')).toBeInTheDocument()
    expect(screen.getByText('Express')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
  })

  it('calls onSolve with defaults when Solve is clicked', () => {
    const onSolve = vi.fn()
    render(<RoutingInputs onSolve={onSolve} loading={false} />)
    fireEvent.click(screen.getByRole('button', { name: /solve/i }))
    expect(onSolve).toHaveBeenCalledWith('GROUND', 1)
  })

  it('disables Solve when no productId', () => {
    vi.mocked(appStore.useAppStore).mockReturnValue({
      ...defaultStore,
      selectedProductId: null,
    } as any)
    render(<RoutingInputs onSolve={vi.fn()} loading={false} />)
    expect(screen.getByRole('button', { name: /solve/i })).toBeDisabled()
  })

  it('disables Solve when loading', () => {
    render(<RoutingInputs onSolve={vi.fn()} loading />)
    expect(screen.getByRole('button', { name: /solve/i })).toBeDisabled()
  })
})

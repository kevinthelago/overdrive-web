import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RouteCard } from '../RouteCard'
import type { Route } from '../types'

const makeRoute = (overrides: Partial<Route> = {}): Route => ({
  id: 'r1',
  origin: 'LAX',
  destination: 'JFK',
  carrier: { scac: 'FEDX', name: 'FedEx', mode: 'Parcel' },
  serviceLevel: 'Ground',
  transitDays: 5,
  cost: {
    lineHaul: 8500,
    fuelSurcharge: 1200,
    residentialDelivery: 400,
    deliveryAreaSurcharge: 0,
    dimensionalWeight: 0,
    signatureRequired: 0,
    otherAccessorials: 0,
  },
  ratedAt: '2026-06-17T00:00:00Z',
  isCurrent: false,
  ...overrides,
})

describe('RouteCard', () => {
  it('renders carrier name', () => {
    render(<RouteCard route={makeRoute()} />)
    expect(screen.getByText('FedEx')).toBeInTheDocument()
  })

  it('renders service level', () => {
    render(<RouteCard route={makeRoute()} />)
    expect(screen.getByText('Ground')).toBeInTheDocument()
  })

  it('shows transit days', () => {
    render(<RouteCard route={makeRoute({ transitDays: 3 })} />)
    expect(screen.getByText(/3 days/)).toBeInTheDocument()
  })

  it('shows "Current" badge when isCurrent', () => {
    render(<RouteCard route={makeRoute({ isCurrent: true })} isCurrent />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('shows savings when currentCost is provided and route is cheaper', () => {
    const route = makeRoute() // total = 8500 + 1200 + 400 = 10100 cents
    render(<RouteCard route={route} currentCost={15000} />)
    expect(screen.getByText(/Save/)).toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(<RouteCard route={makeRoute()} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('marks button as aria-pressed when selected', () => {
    render(<RouteCard route={makeRoute()} isSelected />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})

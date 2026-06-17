import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RouteList } from '../RouteList'
import type { Route } from '../types'

function makeRoute(id: string, overrides: Partial<Route> = {}): Route {
  return {
    id,
    origin: 'LAX',
    destination: 'JFK',
    carrier: { scac: 'FEDX', name: 'FedEx', mode: 'Parcel' },
    serviceLevel: 'Ground',
    transitDays: 5,
    cost: {
      lineHaul: 10000,
      fuelSurcharge: 1000,
      residentialDelivery: 0,
      deliveryAreaSurcharge: 0,
      dimensionalWeight: 0,
      signatureRequired: 0,
      otherAccessorials: 0,
    },
    ratedAt: '2026-06-17T00:00:00Z',
    isCurrent: false,
    ...overrides,
  }
}

const current = makeRoute('current', { isCurrent: true, carrier: { scac: 'FEDX', name: 'FedEx', mode: 'Parcel' } })
const ltlRoute = makeRoute('ltl', { carrier: { scac: 'RDWY', name: 'Old Dominion', mode: 'LTL' } })
const fastRoute = makeRoute('fast', { transitDays: 1, carrier: { scac: 'UPSG', name: 'UPS', mode: 'Parcel' } })

describe('RouteList', () => {
  const defaults = {
    routes: [current, ltlRoute, fastRoute],
    currentRoute: current,
    selectedRouteId: null,
    onSelect: vi.fn(),
    filter: {},
    onFilterChange: vi.fn(),
  }

  it('renders all routes', () => {
    render(<RouteList {...defaults} />)
    expect(screen.getByText('FedEx')).toBeInTheDocument()
    expect(screen.getByText('Old Dominion')).toBeInTheDocument()
    expect(screen.getByText('UPS')).toBeInTheDocument()
  })

  it('shows route count', () => {
    render(<RouteList {...defaults} />)
    expect(screen.getByText(/3 routes/)).toBeInTheDocument()
  })

  it('calls onSelect with route id when a card is clicked', () => {
    const onSelect = vi.fn()
    render(<RouteList {...defaults} onSelect={onSelect} />)
    const buttons = screen.getAllByRole('button')
    // find the LTL route button
    const ltlButton = buttons.find((b) => b.textContent?.includes('Old Dominion'))!
    fireEvent.click(ltlButton)
    expect(onSelect).toHaveBeenCalledWith('ltl')
  })

  it('filters by mode when a mode chip is clicked', () => {
    const onFilterChange = vi.fn()
    render(<RouteList {...defaults} onFilterChange={onFilterChange} />)
    // Click the LTL mode chip (filter chips are button elements in the filter row)
    const ltlChip = screen.getAllByRole('button').find(
      (b) => b.textContent?.trim() === 'LTL' && b.className.includes('rounded-full'),
    )!
    fireEvent.click(ltlChip)
    expect(onFilterChange).toHaveBeenCalled()
  })

  it('shows no-results message when filter matches nothing', () => {
    render(
      <RouteList
        {...defaults}
        filter={{ mode: ['Rail'] }} // no rail routes
      />,
    )
    expect(screen.getByText(/No routes match/)).toBeInTheDocument()
  })
})

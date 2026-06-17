import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CandidateTable } from '../CandidateTable'
import type { SolvedCandidate } from '../types'

function money(amount: number) {
  return { amount, currency: 'USD' }
}

function makeCost(base: number) {
  return {
    baseRate: money(base),
    fuelSurcharge: money(base * 0.1),
    residentialSurcharge: money(0),
    accessorialFees: money(0),
    peakSurcharge: money(0),
    deliveryAreaSurcharge: money(0),
    other: money(0),
    total: money(base * 1.1),
  }
}

function makeCandidate(overrides: Partial<SolvedCandidate> = {}): SolvedCandidate {
  return {
    carrierId: 'fedx',
    carrierName: 'FedEx',
    serviceLevel: 'GROUND',
    transitDays: 5,
    cost: makeCost(100),
    factors: [],
    deltaCost: money(-20),
    infeasible: false,
    ...overrides,
  }
}

describe('CandidateTable', () => {
  it('renders candidate rows', () => {
    const candidates = [
      makeCandidate({ carrierId: 'fedx', carrierName: 'FedEx' }),
      makeCandidate({ carrierId: 'ups', carrierName: 'UPS', serviceLevel: 'EXPRESS' }),
    ]
    render(<CandidateTable candidates={candidates} />)
    expect(screen.getByText('FedEx')).toBeInTheDocument()
    expect(screen.getByText('UPS')).toBeInTheDocument()
  })

  it('shows BEST pill on winner row', () => {
    const candidates = [makeCandidate()]
    render(<CandidateTable candidates={candidates} winnerId="fedx-GROUND" />)
    expect(screen.getByText('BEST')).toBeInTheDocument()
  })

  it('shows N/A pill on infeasible row', () => {
    const candidates = [makeCandidate({ infeasible: true })]
    render(<CandidateTable candidates={candidates} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('expands row on click to show breakdown', () => {
    const candidates = [makeCandidate()]
    render(<CandidateTable candidates={candidates} />)
    const row = screen.getByText('FedEx').closest('tr')!
    fireEvent.click(row)
    // After expand, base rate label appears in breakdown
    expect(screen.getByText('Base Rate:')).toBeInTheDocument()
  })

  it('collapses row on second click', () => {
    const candidates = [makeCandidate()]
    render(<CandidateTable candidates={candidates} />)
    const row = screen.getByText('FedEx').closest('tr')!
    fireEvent.click(row)
    expect(screen.getByText('Base Rate:')).toBeInTheDocument()
    fireEvent.click(row)
    expect(screen.queryByText('Base Rate:')).not.toBeInTheDocument()
  })
})

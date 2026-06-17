import { describe, it, expect } from 'vitest'
import { totalCost } from '../types'
import type { CostBreakdown } from '../types'

const makeCost = (overrides: Partial<CostBreakdown> = {}): CostBreakdown => ({
  lineHaul: 0,
  fuelSurcharge: 0,
  residentialDelivery: 0,
  deliveryAreaSurcharge: 0,
  dimensionalWeight: 0,
  signatureRequired: 0,
  otherAccessorials: 0,
  ...overrides,
})

describe('totalCost', () => {
  it('returns 0 for an empty breakdown', () => {
    expect(totalCost(makeCost())).toBe(0)
  })

  it('sums all components', () => {
    const cost = makeCost({ lineHaul: 10000, fuelSurcharge: 2000, otherAccessorials: 500 })
    expect(totalCost(cost)).toBe(12500)
  })

  it('works when only line haul is set', () => {
    expect(totalCost(makeCost({ lineHaul: 5000 }))).toBe(5000)
  })
})

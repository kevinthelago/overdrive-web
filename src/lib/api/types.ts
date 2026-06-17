/** Shared DTO types used across API client and feature modules. */

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface Money {
  amount: number
  currency: string
}

export interface CostBreakdown {
  baseRate: Money
  fuelSurcharge: Money
  residentialSurcharge: Money
  accessorialFees: Money
  peakSurcharge: Money
  deliveryAreaSurcharge: Money
  other: Money
  total: Money
}

/** Product / SKU reference */
export interface Product {
  id: string
  sku: string
  name: string
  weightLb: number
  dimensionsIn: { length: number; width: number; height: number }
  category: string
}

/** Scenario context */
export interface Scenario {
  id: string
  name: string
  description?: string
  isBaseline: boolean
  createdAt: string
  updatedAt: string
}

/** Carrier route candidate returned by the routing engine */
export interface RouteCandidate {
  carrierId: string
  carrierName: string
  serviceLevel: string
  transitDays: number
  cost: CostBreakdown
  factors: RouteFactor[]
}

export interface RouteFactor {
  key: string
  label: string
  impact: 'positive' | 'negative' | 'neutral'
  explanation: string
}

/** Opportunity ranking entry */
export interface OpportunityEntry {
  productId: string
  productSku: string
  productName: string
  currentCost: Money
  optimizedCost: Money
  savingsAmount: Money
  savingsPct: number
  rank: number
}

/** Competitor pricing comparison */
export interface CompetitorComparison {
  competitorId: string
  competitorName: string
  theirCost: Money
  ourCost: Money
  differential: Money
  differentialPct: number
}

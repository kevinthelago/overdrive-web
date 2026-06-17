/** Money value in USD cents to avoid float precision issues */
export type Cents = number

export interface CostBreakdown {
  lineHaul: Cents
  fuelSurcharge: Cents
  residentialDelivery: Cents
  deliveryAreaSurcharge: Cents
  dimensionalWeight: Cents
  signatureRequired: Cents
  otherAccessorials: Cents
}

export function totalCost(breakdown: CostBreakdown): Cents {
  return Object.values(breakdown).reduce((sum, v) => sum + v, 0)
}

export interface Carrier {
  scac: string
  name: string
  mode: 'LTL' | 'TL' | 'Parcel' | 'Rail' | 'Intermodal'
}

export interface Route {
  id: string
  origin: string
  destination: string
  carrier: Carrier
  serviceLevel: string
  transitDays: number
  cost: CostBreakdown
  /** ISO date string when this rate was retrieved */
  ratedAt: string
  /** Whether this is the currently-used route for the shipment */
  isCurrent: boolean
}

export interface RouteOpportunity {
  shipmentId: string
  origin: string
  destination: string
  weight: number
  dimensions: { length: number; width: number; height: number }
  currentRoute: Route
  alternativeRoutes: Route[]
  bestSavings: Cents
}

export interface RouteFilter {
  mode?: Carrier['mode'][]
  maxTransitDays?: number
  carriersInclude?: string[]
  carriersExclude?: string[]
}

export interface RouteSortKey {
  field: 'cost' | 'transitDays' | 'carrier'
  direction: 'asc' | 'desc'
}

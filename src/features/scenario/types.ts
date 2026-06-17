export type OverrideType =
  | 'ADD_WAREHOUSE'
  | 'REMOVE_WAREHOUSE'
  | 'ADD_CARRIER'
  | 'REMOVE_CARRIER'
  | 'SUPPLIER_PRICE_DELTA'
  | 'FEE_SCHEDULE_CHANGE'
  | 'DEMAND_FACTOR_CHANGE';

export interface ScenarioOverride {
  id: string;
  type: OverrideType;
  entityId: string;
  value?: number;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  overrides: ScenarioOverride[];
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioCreateRequest {
  name: string;
  description?: string;
  overrides: Omit<ScenarioOverride, 'id'>[];
}

export interface ScenarioUpdateRequest {
  name: string;
  description?: string;
  overrides: Omit<ScenarioOverride, 'id'>[];
}

export type CompareStatus = 'CHEAPER' | 'RISEN' | 'UNCHANGED' | 'UNCOSTABLE';

export interface RouteRef {
  carrierId: string;
  carrierName: string;
  warehouseId: string;
  warehouseName: string;
  transitDays: number;
}

export interface ProductCompareRow {
  productId: string;
  productName: string;
  baselineRoute: RouteRef | null;
  scenarioRoute: RouteRef | null;
  baselineCost: number;
  scenarioCost: number | null;
  costDelta: number | null;
  baselineSavings: number;
  scenarioSavings: number | null;
  savingsDelta: number | null;
  status: CompareStatus;
  uncostableReason?: string;
  staleOverrides?: string[];
}

export interface ScenarioCompareResult {
  scenarioId: string;
  scenarioName: string;
  rows: ProductCompareRow[];
  totalProducts: number;
  cheaperCount: number;
  risenCount: number;
  uncostableCount: number;
}

export interface ScenarioCompareRequest {
  productIds?: string[];
}

export interface OverrideDraft {
  type: OverrideType;
  entityId: string;
  value?: number;
}

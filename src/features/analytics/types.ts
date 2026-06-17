export interface CostComponentBreakdown {
  component: string;
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
  mean: number;
}

export interface CostBreakdownDistribution {
  components: CostComponentBreakdown[];
}

export interface FreightLane {
  from: string;
  to: string;
  mode: string;
  carrier: string;
  volume: number;
  avgCost: number;
}

export interface FreightAnalytics {
  lanes: FreightLane[];
  byMode: Array<{ mode: string; volume: number; share: number }>;
  byCarrier: Array<{ carrier: string; volume: number; share: number }>;
}

export interface WarehouseUtilization {
  warehouseId: string;
  warehouseName: string;
  capacity: number;
  used: number;
  utilizationRate: number;
}

export interface SavingsDistribution {
  buckets: Array<{ min: number; max: number; count: number }>;
  mean: number;
  median: number;
  p90: number;
  total: number;
}

export interface CompetitorMatrixCell {
  competitorId: string;
  competitorName: string;
  productId: string;
  productName: string;
  ourCost: number;
  theirCost: number;
  savings: number;
  savingsPct: number;
  status: 'winning' | 'losing' | 'tied';
}

export interface CompetitorMatrix {
  competitors: string[];
  products: string[];
  cells: CompetitorMatrixCell[];
}

export interface RegionOpportunity {
  region: string;
  stateCode: string;
  opportunityScore: number;
  estimatedSavings: number;
  productCount: number;
}

export interface OpportunityRankingItem {
  rank: number;
  productId: string;
  productName: string;
  opportunityScore: number;
  estimatedAnnualSavings: number;
  topFactor: string;
}

export interface AnalyticsParams {
  scenarioId?: string;
}

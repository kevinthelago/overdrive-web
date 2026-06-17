export type ProductCategory =
  | 'STANDARD'
  | 'PERISHABLE'
  | 'HAZMAT'
  | 'DANGEROUS_GOODS'
  | 'HIGH_VALUE';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  weightLb: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  declaredValue?: number;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Carrier {
  id: string;
  code: string;
  name: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceLevel {
  id: string;
  carrierId: string;
  carrierName: string;
  code: string;
  name: string;
  minTransitDays: number;
  maxTransitDays: number;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RateTable {
  id: string;
  carrierId: string;
  carrierName: string;
  serviceLevelId: string;
  serviceLevelName: string;
  originZone: string;
  destZone: string;
  weightMinLb: number;
  weightMaxLb: number;
  rateCents: number;
  effectiveDate: string;
  expiryDate?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface BlockedDeleteReference {
  type: string;
  id: string;
  name: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  references?: BlockedDeleteReference[];
}

export interface ListParams {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProductListParams extends ListParams {
  category?: ProductCategory | '';
  active?: boolean;
}

export interface WarehouseListParams extends ListParams {
  active?: boolean;
}

export interface CarrierListParams extends ListParams {
  active?: boolean;
}

export interface ServiceLevelListParams extends ListParams {
  carrierId?: string;
  active?: boolean;
}

export interface RateTableListParams extends ListParams {
  carrierId?: string;
  serviceLevelId?: string;
}

export type ProductCreateRequest = Omit<Product, 'id' | 'version' | 'createdAt' | 'updatedAt'>;
export type ProductUpdateRequest = ProductCreateRequest & { version: number };

export type WarehouseCreateRequest = Omit<Warehouse, 'id' | 'version' | 'createdAt' | 'updatedAt'>;
export type WarehouseUpdateRequest = WarehouseCreateRequest & { version: number };

export type CarrierCreateRequest = Omit<Carrier, 'id' | 'version' | 'createdAt' | 'updatedAt'>;
export type CarrierUpdateRequest = CarrierCreateRequest & { version: number };

export type ServiceLevelCreateRequest = Omit<ServiceLevel, 'id' | 'carrierName' | 'version' | 'createdAt' | 'updatedAt'>;
export type ServiceLevelUpdateRequest = ServiceLevelCreateRequest & { version: number };

export type RateTableCreateRequest = Omit<RateTable, 'id' | 'carrierName' | 'serviceLevelName' | 'version' | 'createdAt' | 'updatedAt'>;
export type RateTableUpdateRequest = RateTableCreateRequest & { version: number };

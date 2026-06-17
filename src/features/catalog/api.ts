import { apiClient } from '../../lib/api/client';
import type {
  Page,
  Product,
  ProductCreateRequest,
  ProductListParams,
  Warehouse,
  WarehouseCreateRequest,
  WarehouseListParams,
  Carrier,
  CarrierCreateRequest,
  CarrierListParams,
  ServiceLevel,
  ServiceLevelCreateRequest,
  ServiceLevelListParams,
  RateTable,
  RateTableCreateRequest,
  RateTableListParams,
} from './types';

function toQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

function ifMatchHeaders(version: number): Record<string, string> {
  return { 'If-Match': `"${version}"` };
}

// Products
export function listProducts(params: ProductListParams): Promise<Page<Product>> {
  return apiClient(`/api/catalog/products${toQueryString(params)}`);
}

export function getProduct(id: string): Promise<Product> {
  return apiClient(`/api/catalog/products/${id}`);
}

export function createProduct(data: ProductCreateRequest): Promise<Product> {
  return apiClient('/api/catalog/products', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProduct(id: string, data: ProductCreateRequest, version: number): Promise<Product> {
  return apiClient(`/api/catalog/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: ifMatchHeaders(version),
  });
}

export function deleteProduct(id: string, version: number): Promise<void> {
  return apiClient(`/api/catalog/products/${id}`, {
    method: 'DELETE',
    headers: ifMatchHeaders(version),
  });
}

// Warehouses
export function listWarehouses(params: WarehouseListParams): Promise<Page<Warehouse>> {
  return apiClient(`/api/catalog/warehouses${toQueryString(params)}`);
}

export function getWarehouse(id: string): Promise<Warehouse> {
  return apiClient(`/api/catalog/warehouses/${id}`);
}

export function createWarehouse(data: WarehouseCreateRequest): Promise<Warehouse> {
  return apiClient('/api/catalog/warehouses', { method: 'POST', body: JSON.stringify(data) });
}

export function updateWarehouse(id: string, data: WarehouseCreateRequest, version: number): Promise<Warehouse> {
  return apiClient(`/api/catalog/warehouses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: ifMatchHeaders(version),
  });
}

export function deleteWarehouse(id: string, version: number): Promise<void> {
  return apiClient(`/api/catalog/warehouses/${id}`, {
    method: 'DELETE',
    headers: ifMatchHeaders(version),
  });
}

// Carriers
export function listCarriers(params: CarrierListParams): Promise<Page<Carrier>> {
  return apiClient(`/api/catalog/carriers${toQueryString(params)}`);
}

export function getCarrier(id: string): Promise<Carrier> {
  return apiClient(`/api/catalog/carriers/${id}`);
}

export function createCarrier(data: CarrierCreateRequest): Promise<Carrier> {
  return apiClient('/api/catalog/carriers', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCarrier(id: string, data: CarrierCreateRequest, version: number): Promise<Carrier> {
  return apiClient(`/api/catalog/carriers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: ifMatchHeaders(version),
  });
}

export function deleteCarrier(id: string, version: number): Promise<void> {
  return apiClient(`/api/catalog/carriers/${id}`, {
    method: 'DELETE',
    headers: ifMatchHeaders(version),
  });
}

// Service Levels
export function listServiceLevels(params: ServiceLevelListParams): Promise<Page<ServiceLevel>> {
  return apiClient(`/api/catalog/service-levels${toQueryString(params)}`);
}

export function getServiceLevel(id: string): Promise<ServiceLevel> {
  return apiClient(`/api/catalog/service-levels/${id}`);
}

export function createServiceLevel(data: ServiceLevelCreateRequest): Promise<ServiceLevel> {
  return apiClient('/api/catalog/service-levels', { method: 'POST', body: JSON.stringify(data) });
}

export function updateServiceLevel(id: string, data: ServiceLevelCreateRequest, version: number): Promise<ServiceLevel> {
  return apiClient(`/api/catalog/service-levels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: ifMatchHeaders(version),
  });
}

export function deleteServiceLevel(id: string, version: number): Promise<void> {
  return apiClient(`/api/catalog/service-levels/${id}`, {
    method: 'DELETE',
    headers: ifMatchHeaders(version),
  });
}

// Rate Tables
export function listRateTables(params: RateTableListParams): Promise<Page<RateTable>> {
  return apiClient(`/api/catalog/rate-tables${toQueryString(params)}`);
}

export function getRateTable(id: string): Promise<RateTable> {
  return apiClient(`/api/catalog/rate-tables/${id}`);
}

export function createRateTable(data: RateTableCreateRequest): Promise<RateTable> {
  return apiClient('/api/catalog/rate-tables', { method: 'POST', body: JSON.stringify(data) });
}

export function updateRateTable(id: string, data: RateTableCreateRequest, version: number): Promise<RateTable> {
  return apiClient(`/api/catalog/rate-tables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: ifMatchHeaders(version),
  });
}

export function deleteRateTable(id: string, version: number): Promise<void> {
  return apiClient(`/api/catalog/rate-tables/${id}`, {
    method: 'DELETE',
    headers: ifMatchHeaders(version),
  });
}

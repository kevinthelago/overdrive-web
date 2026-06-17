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

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function ifMatch(version: number): Record<string, string> {
  return { 'If-Match': `"${version}"` };
}

// Products
export function listProducts(params: ProductListParams): Promise<Page<Product>> {
  return apiClient.get('/api/catalog/products', { params: params as QueryParams });
}

export function getProduct(id: string): Promise<Product> {
  return apiClient.get(`/api/catalog/products/${id}`);
}

export function createProduct(data: ProductCreateRequest): Promise<Product> {
  return apiClient.post('/api/catalog/products', data);
}

export function updateProduct(id: string, data: ProductCreateRequest, version: number): Promise<Product> {
  return apiClient.put(`/api/catalog/products/${id}`, data, { headers: ifMatch(version) });
}

export function deleteProduct(id: string, version: number): Promise<void> {
  return apiClient.delete(`/api/catalog/products/${id}`, { headers: ifMatch(version) });
}

// Warehouses
export function listWarehouses(params: WarehouseListParams): Promise<Page<Warehouse>> {
  return apiClient.get('/api/catalog/warehouses', { params: params as QueryParams });
}

export function getWarehouse(id: string): Promise<Warehouse> {
  return apiClient.get(`/api/catalog/warehouses/${id}`);
}

export function createWarehouse(data: WarehouseCreateRequest): Promise<Warehouse> {
  return apiClient.post('/api/catalog/warehouses', data);
}

export function updateWarehouse(id: string, data: WarehouseCreateRequest, version: number): Promise<Warehouse> {
  return apiClient.put(`/api/catalog/warehouses/${id}`, data, { headers: ifMatch(version) });
}

export function deleteWarehouse(id: string, version: number): Promise<void> {
  return apiClient.delete(`/api/catalog/warehouses/${id}`, { headers: ifMatch(version) });
}

// Carriers
export function listCarriers(params: CarrierListParams): Promise<Page<Carrier>> {
  return apiClient.get('/api/catalog/carriers', { params: params as QueryParams });
}

export function getCarrier(id: string): Promise<Carrier> {
  return apiClient.get(`/api/catalog/carriers/${id}`);
}

export function createCarrier(data: CarrierCreateRequest): Promise<Carrier> {
  return apiClient.post('/api/catalog/carriers', data);
}

export function updateCarrier(id: string, data: CarrierCreateRequest, version: number): Promise<Carrier> {
  return apiClient.put(`/api/catalog/carriers/${id}`, data, { headers: ifMatch(version) });
}

export function deleteCarrier(id: string, version: number): Promise<void> {
  return apiClient.delete(`/api/catalog/carriers/${id}`, { headers: ifMatch(version) });
}

// Service Levels
export function listServiceLevels(params: ServiceLevelListParams): Promise<Page<ServiceLevel>> {
  return apiClient.get('/api/catalog/service-levels', { params: params as QueryParams });
}

export function getServiceLevel(id: string): Promise<ServiceLevel> {
  return apiClient.get(`/api/catalog/service-levels/${id}`);
}

export function createServiceLevel(data: ServiceLevelCreateRequest): Promise<ServiceLevel> {
  return apiClient.post('/api/catalog/service-levels', data);
}

export function updateServiceLevel(id: string, data: ServiceLevelCreateRequest, version: number): Promise<ServiceLevel> {
  return apiClient.put(`/api/catalog/service-levels/${id}`, data, { headers: ifMatch(version) });
}

export function deleteServiceLevel(id: string, version: number): Promise<void> {
  return apiClient.delete(`/api/catalog/service-levels/${id}`, { headers: ifMatch(version) });
}

// Rate Tables
export function listRateTables(params: RateTableListParams): Promise<Page<RateTable>> {
  return apiClient.get('/api/catalog/rate-tables', { params: params as QueryParams });
}

export function getRateTable(id: string): Promise<RateTable> {
  return apiClient.get(`/api/catalog/rate-tables/${id}`);
}

export function createRateTable(data: RateTableCreateRequest): Promise<RateTable> {
  return apiClient.post('/api/catalog/rate-tables', data);
}

export function updateRateTable(id: string, data: RateTableCreateRequest, version: number): Promise<RateTable> {
  return apiClient.put(`/api/catalog/rate-tables/${id}`, data, { headers: ifMatch(version) });
}

export function deleteRateTable(id: string, version: number): Promise<void> {
  return apiClient.delete(`/api/catalog/rate-tables/${id}`, { headers: ifMatch(version) });
}

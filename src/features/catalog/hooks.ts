import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  listCarriers,
  getCarrier,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  listServiceLevels,
  getServiceLevel,
  createServiceLevel,
  updateServiceLevel,
  deleteServiceLevel,
  listRateTables,
  getRateTable,
  createRateTable,
  updateRateTable,
  deleteRateTable,
} from './api';
import type {
  Product,
  ProductListParams,
  ProductCreateRequest,
  Warehouse,
  WarehouseListParams,
  WarehouseCreateRequest,
  Carrier,
  CarrierListParams,
  CarrierCreateRequest,
  ServiceLevel,
  ServiceLevelListParams,
  ServiceLevelCreateRequest,
  RateTable,
  RateTableListParams,
  RateTableCreateRequest,
  Page,
} from './types';

// ─── Products ──────────────────────────────────────────────────────────────

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ['catalog', 'products', params],
    queryFn: () => listProducts(params),
  });
}

export function useProduct(id: string, options?: Partial<UseQueryOptions<Product>>) {
  return useQuery({
    queryKey: ['catalog', 'products', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreateRequest) => createProduct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, version }: { id: string; data: ProductCreateRequest; version: number }) =>
      updateProduct(id, data, version),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'products'] });
      qc.invalidateQueries({ queryKey: ['catalog', 'products', id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => deleteProduct(id, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'products'] }),
  });
}

// ─── Warehouses ─────────────────────────────────────────────────────────────

export function useWarehouses(params: WarehouseListParams) {
  return useQuery({
    queryKey: ['catalog', 'warehouses', params],
    queryFn: () => listWarehouses(params),
  });
}

export function useWarehouse(id: string, options?: Partial<UseQueryOptions<Warehouse>>) {
  return useQuery({
    queryKey: ['catalog', 'warehouses', id],
    queryFn: () => getWarehouse(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WarehouseCreateRequest) => createWarehouse(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'warehouses'] }),
  });
}

export function useUpdateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, version }: { id: string; data: WarehouseCreateRequest; version: number }) =>
      updateWarehouse(id, data, version),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'warehouses'] });
      qc.invalidateQueries({ queryKey: ['catalog', 'warehouses', id] });
    },
  });
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => deleteWarehouse(id, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'warehouses'] }),
  });
}

// ─── Carriers ───────────────────────────────────────────────────────────────

export function useCarriers(params: CarrierListParams) {
  return useQuery({
    queryKey: ['catalog', 'carriers', params],
    queryFn: () => listCarriers(params),
  });
}

export function useCarrier(id: string, options?: Partial<UseQueryOptions<Carrier>>) {
  return useQuery({
    queryKey: ['catalog', 'carriers', id],
    queryFn: () => getCarrier(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateCarrier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CarrierCreateRequest) => createCarrier(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'carriers'] }),
  });
}

export function useUpdateCarrier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, version }: { id: string; data: CarrierCreateRequest; version: number }) =>
      updateCarrier(id, data, version),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'carriers'] });
      qc.invalidateQueries({ queryKey: ['catalog', 'carriers', id] });
    },
  });
}

export function useDeleteCarrier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => deleteCarrier(id, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'carriers'] }),
  });
}

// ─── Service Levels ─────────────────────────────────────────────────────────

export function useServiceLevels(params: ServiceLevelListParams) {
  return useQuery({
    queryKey: ['catalog', 'service-levels', params],
    queryFn: () => listServiceLevels(params),
  });
}

export function useServiceLevel(id: string, options?: Partial<UseQueryOptions<ServiceLevel>>) {
  return useQuery({
    queryKey: ['catalog', 'service-levels', id],
    queryFn: () => getServiceLevel(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateServiceLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceLevelCreateRequest) => createServiceLevel(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'service-levels'] }),
  });
}

export function useUpdateServiceLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, version }: { id: string; data: ServiceLevelCreateRequest; version: number }) =>
      updateServiceLevel(id, data, version),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'service-levels'] });
      qc.invalidateQueries({ queryKey: ['catalog', 'service-levels', id] });
    },
  });
}

export function useDeleteServiceLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => deleteServiceLevel(id, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'service-levels'] }),
  });
}

// ─── Rate Tables ─────────────────────────────────────────────────────────────

export function useRateTables(params: RateTableListParams) {
  return useQuery({
    queryKey: ['catalog', 'rate-tables', params],
    queryFn: () => listRateTables(params),
  });
}

export function useRateTable(id: string, options?: Partial<UseQueryOptions<RateTable>>) {
  return useQuery({
    queryKey: ['catalog', 'rate-tables', id],
    queryFn: () => getRateTable(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateRateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RateTableCreateRequest) => createRateTable(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'rate-tables'] }),
  });
}

export function useUpdateRateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, version }: { id: string; data: RateTableCreateRequest; version: number }) =>
      updateRateTable(id, data, version),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'rate-tables'] });
      qc.invalidateQueries({ queryKey: ['catalog', 'rate-tables', id] });
    },
  });
}

export function useDeleteRateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => deleteRateTable(id, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalog', 'rate-tables'] }),
  });
}

// ─── Carrier list for select dropdowns ───────────────────────────────────────

export function useAllCarriers() {
  return useQuery<Page<Carrier>>({
    queryKey: ['catalog', 'carriers', { size: 200 }],
    queryFn: () => listCarriers({ size: 200, sort: 'name,asc' }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useServiceLevelsByCarrier(carrierId: string) {
  return useQuery<Page<ServiceLevel>>({
    queryKey: ['catalog', 'service-levels', { carrierId, size: 200 }],
    queryFn: () => listServiceLevels({ carrierId, size: 200, sort: 'name,asc' }),
    enabled: !!carrierId,
    staleTime: 5 * 60 * 1000,
  });
}

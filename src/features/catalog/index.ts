import React from 'react';
import { Navigate } from 'react-router-dom';
import { CatalogPage } from './CatalogPage';
import { ProductList } from './products/ProductList';
import { WarehouseList } from './warehouses/WarehouseList';
import { CarrierList } from './carriers/CarrierList';
import { ServiceLevelList } from './serviceLevels/ServiceLevelList';
import { RateTableList } from './rateTables/RateTableList';

export const catalogRoutes = [
  {
    path: 'catalog',
    element: React.createElement(CatalogPage),
    children: [
      { index: true, element: React.createElement(Navigate, { to: 'products', replace: true }) },
      { path: 'products', element: React.createElement(ProductList) },
      { path: 'warehouses', element: React.createElement(WarehouseList) },
      { path: 'carriers', element: React.createElement(CarrierList) },
      { path: 'service-levels', element: React.createElement(ServiceLevelList) },
      { path: 'rate-tables', element: React.createElement(RateTableList) },
    ],
  },
];

export type { Product, Warehouse, Carrier, ServiceLevel, RateTable } from './types';

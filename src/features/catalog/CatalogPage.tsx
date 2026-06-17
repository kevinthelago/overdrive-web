import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';

const TABS = [
  { to: 'products', label: 'Products' },
  { to: 'warehouses', label: 'Warehouses' },
  { to: 'carriers', label: 'Carriers' },
  { to: 'service-levels', label: 'Service Levels' },
  { to: 'rate-tables', label: 'Rate Tables' },
];

export function CatalogPage() {
  const location = useLocation();
  const isRoot = location.pathname.replace(/\/$/, '').endsWith('/catalog');

  if (isRoot) {
    return <Navigate to="products" replace />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Catalog Admin</h1>
        <p className="mt-1 text-sm text-white/50">Manage products, warehouses, carriers, service levels, and rates.</p>
      </div>

      <nav className="flex gap-1 border-b border-white/10" aria-label="Catalog sections">
        {TABS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-white/50 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}

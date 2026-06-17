import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    label: 'Analyze',
    items: [
      {
        to: '/routing',
        label: 'Routing Explorer',
        icon: <RouteIcon />,
      },
      {
        to: '/opportunities',
        label: 'Opportunity Rankings',
        icon: <TrendingUpIcon />,
      },
      {
        to: '/competitors',
        label: 'Competitor Comparison',
        icon: <BarChartIcon />,
      },
      {
        to: '/scenarios',
        label: 'Scenario Builder',
        icon: <FlaskIcon />,
      },
    ],
  },
  {
    label: 'Manage',
    items: [
      {
        to: '/analytics',
        label: 'Analytics',
        icon: <PieChartIcon />,
      },
      {
        to: '/catalog',
        label: 'Catalog Admin',
        icon: <PackageIcon />,
      },
    ],
  },
]

export function Sidebar() {
  return (
    <nav
      className="flex h-full w-sidebar flex-col border-r border-border bg-surface"
      aria-label="Main navigation"
    >
      <div className="flex h-header shrink-0 items-center border-b border-border px-4">
        <span className="font-sans text-sm font-bold tracking-tight text-text-primary">
          Overdrive
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {navigation.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1 px-3 text-2xs font-semibold uppercase tracking-widest text-text-muted">
              {group.label}
            </p>
            <ul>
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded mx-1.5 px-2.5 py-1.5 text-sm transition-colors',
                        isActive
                          ? 'bg-accent-muted text-accent font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised',
                      )
                    }
                  >
                    <span className="h-4 w-4 shrink-0">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}

// ── Inline SVG icons (no dep on icon library) ─────────────────────────────────

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 17h4l1-4h8l1 4h4" />
      <path d="M7 17v-4M17 17v-4" />
      <circle cx="12" cy="7" r="3" />
    </svg>
  )
}

function TrendingUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  )
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="14" width="4" height="7" />
      <rect x="10" y="10" width="4" height="11" />
      <rect x="18" y="6" width="4" height="15" />
    </svg>
  )
}

function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M9 3h6M9 3v8l-4 7a2 2 0 0 0 1.73 3h10.54A2 2 0 0 0 19 18l-4-7V3" />
    </svg>
  )
}

function PieChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  )
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 2l9 4.5v9L12 20 3 15.5v-9L12 2z" />
      <path d="M12 2v18M3 6.5l9 4.5 9-4.5" />
    </svg>
  )
}

import type React from 'react'

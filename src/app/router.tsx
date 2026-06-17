import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { RoutingPage } from '@/features/routing/RoutingPage'

const CompetitorPage = lazy(() =>
  import('@/features/competitor').then((m) => ({ default: m.CompetitorPage }))
)
const OpportunityPage = lazy(() =>
  import('@/features/opportunity').then((m) => ({ default: m.OpportunityPage }))
)

function PageLoader() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center text-sm text-text-muted">
      Loading…
    </div>
  )
}

/** Stub screen used until a feature stream delivers the real screen. */
function ScreenStub({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-2 text-text-muted">
      <p className="text-base font-medium">{title}</p>
      <p className="text-sm">Coming soon</p>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <RoutingPage />,
      },
      {
        path: 'routing',
        element: <RoutingPage />,
      },
      {
        path: 'opportunities',
        element: <Suspense fallback={<PageLoader />}><OpportunityPage /></Suspense>,
      },
      {
        path: 'competitors',
        element: <Suspense fallback={<PageLoader />}><CompetitorPage /></Suspense>,
      },
      {
        path: 'scenarios',
        element: <ScreenStub title="Scenario Builder" />,
      },
      {
        path: 'analytics',
        element: <ScreenStub title="Analytics" />,
      },
      {
        path: 'catalog',
        element: <ScreenStub title="Catalog Admin" />,
      },
    ],
  },
])

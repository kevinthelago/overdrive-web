import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout'

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
        element: <ScreenStub title="Routing Explorer" />,
      },
      {
        path: 'routing',
        element: <ScreenStub title="Routing Explorer" />,
      },
      {
        path: 'opportunities',
        element: <ScreenStub title="Opportunity Rankings" />,
      },
      {
        path: 'competitors',
        element: <ScreenStub title="Competitor Comparison" />,
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

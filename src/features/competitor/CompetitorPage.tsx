import { useState } from 'react'
import { CompetitorList } from './CompetitorList'
import { CompetitorDetail } from './CompetitorDetail'
import { CompetitorMap } from './CompetitorMap'
import type { Competitor } from './types'

type Tab = 'list' | 'map'

export function CompetitorPage() {
  const [selected, setSelected] = useState<Competitor | null>(null)
  const [tab, setTab] = useState<Tab>('list')

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Competitor Analysis</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Compare competitors&apos; distribution coverage and strategy.
        </p>
      </header>

      <div className="flex items-center gap-1 border-b border-gray-200 px-6">
        {(['list', 'map'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'list' ? 'List' : 'Map'}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {tab === 'list' && (
            <CompetitorList
              onSelect={setSelected}
              selectedId={selected?.id}
            />
          )}
          {tab === 'map' && <CompetitorMap />}
        </main>

        {selected && (
          <div className="w-96 flex-shrink-0 border-l border-gray-200">
            <CompetitorDetail
              competitorId={selected.id}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { OpportunityList } from './OpportunityList'
import { OpportunityDetail } from './OpportunityDetail'
import { OpportunityMap } from './OpportunityMap'
import type { Opportunity } from './types'

type Tab = 'list' | 'map'

export function OpportunityPage() {
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const [tab, setTab] = useState<Tab>('list')

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Distribution Opportunities</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Ranked distribution opportunities ranked by potential impact.
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
            <OpportunityList
              onSelect={setSelected}
              selectedId={selected?.id}
            />
          )}
          {tab === 'map' && <OpportunityMap />}
        </main>

        {selected && (
          <div className="w-96 flex-shrink-0 border-l border-gray-200">
            <OpportunityDetail
              opportunityId={selected.id}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Segmented } from '@/components/ui'
import { OpportunityList } from './OpportunityList'
import { OpportunityDetail } from './OpportunityDetail'
import { OpportunityMap } from './OpportunityMap'
import type { Opportunity } from './types'

const TABS = [
  { value: 'list', label: 'Rankings' },
  { value: 'map', label: 'Map' },
]

export function OpportunityPage() {
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const [tab, setTab] = useState('list')

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Distribution Opportunities</h1>
          <p className="text-xs text-text-muted">
            Ranked by potential impact on delivered cost and market share.
          </p>
        </div>
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {tab === 'list' && (
            <OpportunityList onSelect={setSelected} />
          )}
          {tab === 'map' && <OpportunityMap />}
        </main>

        {selected && (
          <div className="w-80 flex-shrink-0">
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

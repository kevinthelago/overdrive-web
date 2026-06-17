import { useState } from 'react'
import { Segmented } from '@/components/ui'
import { CompetitorList } from './CompetitorList'
import { CompetitorDetail } from './CompetitorDetail'
import { CompetitorMap } from './CompetitorMap'
import type { Competitor } from './types'

const TABS = [
  { value: 'list', label: 'List' },
  { value: 'map', label: 'Map' },
]

export function CompetitorPage() {
  const [selected, setSelected] = useState<Competitor | null>(null)
  const [tab, setTab] = useState('list')

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Competitor Analysis</h1>
          <p className="text-xs text-text-muted">
            Compare carriers&apos; distribution coverage and positioning.
          </p>
        </div>
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {tab === 'list' && (
            <CompetitorList onSelect={setSelected} />
          )}
          {tab === 'map' && <CompetitorMap />}
        </main>

        {selected && (
          <div className="w-80 flex-shrink-0">
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

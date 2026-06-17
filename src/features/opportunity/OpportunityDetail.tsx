import { useOpportunity } from './api'
import type { OpportunityType } from './types'

const TYPE_LABELS: Record<OpportunityType, string> = {
  UNDERSERVED_LANE: 'Underserved Lane',
  COST_ADVANTAGE: 'Cost Advantage',
  VOLUME_GAP: 'Volume Gap',
  NEW_MARKET: 'New Market',
}

const TYPE_COLORS: Record<OpportunityType, string> = {
  UNDERSERVED_LANE: 'bg-amber-100 text-amber-800',
  COST_ADVANTAGE: 'bg-green-100 text-green-800',
  VOLUME_GAP: 'bg-blue-100 text-blue-800',
  NEW_MARKET: 'bg-purple-100 text-purple-800',
}

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-yellow-500' : 'text-gray-400'
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 36 36" className={`h-16 w-16 ${color}`}>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${score} ${100 - score}`}
          strokeDashoffset="25"
          strokeLinecap="round"
        />
        <text x="18" y="21" textAnchor="middle" className="fill-current text-xs font-bold">
          {score}
        </text>
      </svg>
      <span className="text-xs text-gray-500">Opportunity Score</span>
    </div>
  )
}

type Props = {
  opportunityId: string
  onClose?: () => void
}

export function OpportunityDetail({ opportunityId, onClose }: Props) {
  const { data, isLoading, isError, error } = useOpportunity(opportunityId)

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-white shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">Opportunity Detail</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
            Loading…
          </div>
        )}

        {isError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {(error as Error).message}
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{data.title}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[data.type]}`}
                  >
                    {TYPE_LABELS[data.type]}
                  </span>
                  <span className="text-xs text-gray-500">{data.region}</span>
                </div>
              </div>
              <ScoreGauge score={data.score} />
            </div>

            {data.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
            )}

            {data.estimatedRevenue != null && (
              <div className="rounded-lg bg-emerald-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                  Estimated Revenue Opportunity
                </dt>
                <dd className="mt-1 text-2xl font-bold text-emerald-700">
                  ${(data.estimatedRevenue / 1_000_000).toFixed(2)}M
                </dd>
              </div>
            )}

            {data.affectedLanes && data.affectedLanes.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Affected Lanes
                </h4>
                <ul className="flex flex-col gap-1">
                  {data.affectedLanes.map((lane) => (
                    <li key={lane} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      {lane}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.actionItems && data.actionItems.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action Items
                </h4>
                <ol className="flex flex-col gap-2">
                  {data.actionItems.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

import { useCompetitor } from './api'

type Props = {
  competitorId: string
  onClose?: () => void
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-gray-900">{value}</dd>
    </div>
  )
}

export function CompetitorDetail({ competitorId, onClose }: Props) {
  const { data, isLoading, isError, error } = useCompetitor(competitorId)

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-white shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">Competitor Detail</h2>
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
            <div>
              <h3 className="text-xl font-bold text-gray-900">{data.name}</h3>
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 text-sm text-indigo-600 hover:underline"
              >
                {data.url}
              </a>
            </div>

            {data.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
            )}

            <dl className="grid grid-cols-2 gap-3">
              <StatCard label="Region" value={data.region} />
              {data.marketShare != null && (
                <StatCard label="Market Share" value={`${(data.marketShare * 100).toFixed(1)}%`} />
              )}
              {data.estimatedRevenue != null && (
                <StatCard
                  label="Est. Revenue"
                  value={`$${(data.estimatedRevenue / 1_000_000).toFixed(1)}M`}
                />
              )}
              <StatCard label="States Covered" value={String(data.coverageStates?.length ?? '—')} />
            </dl>

            {data.tags.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.coverageStates && data.coverageStates.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Coverage States
                </h4>
                <div className="flex flex-wrap gap-1">
                  {data.coverageStates.map((s) => (
                    <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

export type Metric = {
  type: string
  ui_score?: number
  raw_score?: number
  skin_type?: string
  region?: string
}

type SkinResultsProps = {
  metrics: Metric[]
}

const displayedTypes = new Set([
  'moisture',
  'oiliness',
  'texture',
  'pore',
  'redness',
  'skin_type',
])

export function SkinResults({ metrics }: SkinResultsProps) {
  const filtered = metrics.filter((item) => displayedTypes.has(item.type))
  if (filtered.length === 0) return null

  return (
    <section className="panel" aria-live="polite">
      <h2>2. YouCam Skin Metrics</h2>
      <p className="note">
        Metrics returned by the YouCam API. Used as context for fragrance
        suggestions, not a medical diagnosis.
      </p>

      <div className="metrics">
        {filtered.map((item, index) => (
          <article className="metric" key={`${item.type}-${item.region ?? index}`}>
            <h3>{item.type.replaceAll('_', ' ')}</h3>
            {item.skin_type && (
              <p className="metric-value">
                {item.skin_type} {item.region ? `(${item.region})` : ''}
              </p>
            )}
            {typeof item.ui_score === 'number' && (
              <p className="metric-value">Score: {item.ui_score} / 100</p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
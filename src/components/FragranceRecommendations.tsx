import type { CurationResult } from '../types'

type FragranceRecommendationsProps = {
  curation: CurationResult | null
  error: string
}

export function FragranceRecommendations({
  curation,
  error,
}: FragranceRecommendationsProps) {
  if (!curation && !error) return null

  return (
    <section className="panel" aria-live="polite">
      <h2>Skin Retention Profile & Fragrance Curation</h2>
      <p className="note">
        Formulation heuristic based on your YouCam skin metrics and scent
        preference. For cosmetic and fragrance shopping guidance only, not a
        medical diagnosis.
      </p>

      {error && <p role="alert" className="error-text">{error}</p>}

      {curation && (
        <>
          <article className="metric">
            <p className="notes">Skin Scent Retention Profile</p>
            <p>{curation.retentionProfile}</p>
          </article>

          <p className="notes">Step 1 · Skin-Prep Layering Base (Matched to Skin Metrics)</p>
          <article className="metric">
            <h3>{curation.skinPrep.name}</h3>
            <p className="note">{curation.skinPrep.focus}</p>
            <p>{curation.skinPrep.reason}</p>
          </article>

          <p className="notes">Step 2 · Curated Perfumes (Matched to Skin Chemistry & Taste)</p>
          <div className="metrics">
            {curation.recommendations.map((fragrance) => (
              <article className="metric" key={fragrance.name}>
                <h3>{fragrance.name}</h3>
                <p className="notes">{fragrance.concentration}</p>
                <p>{fragrance.notes}</p>
                <p>{fragrance.reason}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
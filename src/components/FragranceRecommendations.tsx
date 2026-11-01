import type { CurationResult } from '../types'
import { ProductVisual } from './ProductVisual'

type FragranceRecommendationsProps = {
  curation: CurationResult | null
  error: string
  loading?: boolean
}

export function FragranceRecommendations({
  curation,
  error,
  loading = false,
}: FragranceRecommendationsProps) {
  if (loading && !curation) {
    return (
      <section className="panel loading-curation-panel" aria-live="polite">
        <div className="status-row">
          <span className="spinner" aria-hidden="true" />
          <div>
            <p className="eyebrow">GEMINI OLFACTORY ENGINE</p>
            <h2>Formulating Your Fragrance Curation…</h2>
          </div>
        </div>
        <p className="note">
          Matching your YouCam skin biomarkers with a Skin-Prep Layering Base,
          estimating wear-time longevity in hours, and analyzing your scent
          selection…
        </p>
        <div className="progress-bar-track" aria-hidden="true">
          <div className="progress-bar-fill" />
        </div>
      </section>
    )
  }

  if (!curation && !error) return null

  return (
    <section className="panel" aria-live="polite">
      <h2>3. Skin Retention Profile &amp; Fragrance Curation</h2>
      <p className="note">
        Formulation heuristic based on your YouCam skin metrics and scent
        preference. For cosmetic and fragrance shopping guidance only, not a
        medical diagnosis.
      </p>

      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      {curation && (
        <>
          <article className="metric">
            <p className="notes">Skin Scent Retention Profile</p>
            <p>{curation.retentionProfile}</p>
          </article>

          {curation.customPerfumeAnalysis && (
            <article className="metric custom-perfume-card">
              <div className="metric-header">
                <p className="notes">
                  Your Tested Perfume · Personal Bottle Check
                </p>
                <span className="longevity-badge">
                  ⏱ {curation.customPerfumeAnalysis.longevity}
                </span>
              </div>
              <h3>{curation.customPerfumeAnalysis.name}</h3>
              <p>{curation.customPerfumeAnalysis.verdict}</p>
            </article>
          )}

          <p className="notes">
            Step 1 · Skin-Prep Layering Base (Matched to Skin Metrics)
          </p>
          <article className="metric prep-card">
            <ProductVisual name={curation.skinPrep.name} variant="prep" />
            <div className="prep-card-body">
              <h3>{curation.skinPrep.name}</h3>
              <p className="note">{curation.skinPrep.focus}</p>
              <p>{curation.skinPrep.reason}</p>
            </div>
          </article>

          <p className="notes">
            Step 2 · Curated Perfumes (Matched to Skin Chemistry &amp; Taste)
          </p>
          <div className="metrics">
            {curation.recommendations.map((fragrance) => (
              <article className="metric fragrance-card" key={fragrance.name}>
                <ProductVisual
                  name={fragrance.name}
                  variant="perfume"
                  concentration={fragrance.concentration}
                />
                <div className="metric-header">
                  <h3>{fragrance.name}</h3>
                  <span className="longevity-badge">
                    ⏱ {fragrance.longevity}
                  </span>
                </div>
                <p className="notes">{fragrance.concentration}</p>
                <p className="fragrance-notes">{fragrance.notes}</p>
                <p>{fragrance.reason}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
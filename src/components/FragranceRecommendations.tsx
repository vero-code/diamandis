export type FragranceRecommendation = {
  name: string
  concentration: string
  notes: string
  prep: string
  reason: string
}

type FragranceRecommendationsProps = {
  recommendations: FragranceRecommendation[]
  error: string
}

export function FragranceRecommendations({
  recommendations,
  error,
}: FragranceRecommendationsProps) {
  if (recommendations.length === 0 && !error) return null

  return (
    <section className="panel" aria-live="polite">
      <h2>3. Fragrance & Skin-Prep Curation</h2>
      <p className="note">
        Editorial selections matching your YouCam skin profile and scent
        preference with fragrance concentration, note structure, and unscented
        skin-prep layering.
      </p>

      {error && <p role="alert" className="error-text">{error}</p>}

      {recommendations.length > 0 && (
        <div className="metrics">
          {recommendations.map((fragrance) => (
            <article className="metric" key={fragrance.name}>
              <h3>{fragrance.name}</h3>
              <p className="notes">{fragrance.concentration}</p>
              <p>{fragrance.notes}</p>
              <p>{fragrance.reason}</p>
              <p className="note">
                <strong>Skin-prep layering:</strong> {fragrance.prep}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
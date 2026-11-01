import { useState } from 'react'
import { METRIC_ORDER } from '../constants'
import type { Metric } from '../types'
import { getMetricInsight } from '../utils/metricInsights'

type SkinResultsProps = {
  metrics: Metric[]
}

export function SkinResults({ metrics }: SkinResultsProps) {
  const filtered = metrics
    .filter((item) => METRIC_ORDER.includes(item.type))
    .sort((a, b) => METRIC_ORDER.indexOf(a.type) - METRIC_ORDER.indexOf(b.type))

  // Prefer oiliness or the first metric with a mask_url so a visible mask shows immediately
  const defaultIndex = Math.max(
    0,
    filtered.findIndex((item) => item.type === 'oiliness' && item.mask_url),
  )

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showMask, setShowMask] = useState(true)

  if (filtered.length === 0) return null

  const overallScore = metrics.find((item) => item.type === 'all')?.score
  const skinAge = metrics.find((item) => item.type === 'skin_age')?.score
  const baseImageUrl = metrics.find((item) => item.type === 'resize_image')?.mask_url

  const activeIndex =
    selectedIndex !== null && selectedIndex < filtered.length
      ? selectedIndex
      : defaultIndex
  const activeMetric = filtered[activeIndex]
  const insight = getMetricInsight(activeMetric)

  return (
    <section className="panel" aria-live="polite">
      <div className="section-title-row">
        <h2>YouCam Skin Metrics</h2>
        <div className="score-badges">
          {typeof overallScore === 'number' && (
            <span className="overall-badge">
              Overall Skin Score: {Math.round(overallScore)} / 100
            </span>
          )}
          {typeof skinAge === 'number' && (
            <span className="skin-age-badge">
              Est. Skin Age: {Math.round(skinAge)}
            </span>
          )}
        </div>
      </div>

      <p className="note">
        Click any metric card below to switch the YouCam AI zone mask on your
        portrait and see how it shapes fragrance evaporation and longevity.
      </p>

      <div className="metrics">
        {filtered.map((item, index) => {
          const isActive = index === activeIndex
          return (
            <button
              type="button"
              className={`metric metric-interactive ${isActive ? 'metric-active' : ''}`}
              key={`${item.type}-${item.region ?? index}`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="metric-header">
                <h3>
                  {item.type.replaceAll('_', ' ')}
                  {item.region ? ` · ${item.region.replaceAll('_', ' ')}` : ''}
                </h3>
                <span className="metric-badge">
                  {item.mask_url ? '👁 View' : 'Info'}
                </span>
              </div>
              {item.skin_type && (
                <p className="metric-value">{item.skin_type}</p>
              )}
              {typeof item.ui_score === 'number' && (
                <p className="metric-value">Score: {item.ui_score} / 100</p>
              )}
            </button>
          )
        })}
      </div>

      <article className="metric insight-box">
        <div className="insight-layout">
          {(baseImageUrl || activeMetric.mask_url) && (
            <div className="mask-column">
              <div className="mask-stage">
                <img
                  src={baseImageUrl ?? activeMetric.mask_url}
                  alt="YouCam analyzed portrait"
                  className="mask-base-img"
                  referrerPolicy="no-referrer"
                />
                {showMask &&
                  activeMetric.mask_url &&
                  activeMetric.mask_url !== baseImageUrl && (
                    <img
                      src={activeMetric.mask_url}
                      alt={`${activeMetric.type} diagnostic mask`}
                      className="mask-overlay-img"
                      referrerPolicy="no-referrer"
                    />
                  )}
                {showMask && (
                  <div className="mask-hint-overlay">
                    <span className="mask-hint-sub">
                      ↑ Click any metric card to switch
                    </span>
                  </div>
                )}
              </div>
              {activeMetric.mask_url && baseImageUrl && (
                <button
                  type="button"
                  className="mask-toggle-btn"
                  onClick={() => setShowMask((prev) => !prev)}
                >
                  {showMask ? 'Hide AI Mask Overlay' : 'Show AI Mask Overlay'}
                </button>
              )}
            </div>
          )}

          <div className="insight-text">
            <p className="notes">Olfactory Physics · {insight.title}</p>
            <p>
              <strong>Why this metric matters:</strong> {insight.physics}
            </p>
            <p>
              <strong>What your reading means:</strong> {insight.reading}
            </p>
          </div>
        </div>
      </article>
    </section>
  )
}
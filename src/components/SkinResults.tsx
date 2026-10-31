import { useState } from 'react'

export type Metric = {
  type: string
  ui_score?: number
  raw_score?: number
  score?: number
  skin_type?: string
  region?: string
  mask_url?: string
}

type SkinResultsProps = {
  metrics: Metric[]
}

const displayedTypes = [
  'moisture',
  'oiliness',
  'texture',
  'pore',
  'radiance',
  'redness',
  'skin_type',
]

function getMetricInsight(metric: Metric): {
  title: string
  physics: string
  reading: string
} {
  const score = metric.ui_score ?? 70

  switch (metric.type) {
    case 'oiliness':
      return {
        title: 'Oiliness (Epidermal Sebum & Lipid Mantle)',
        physics:
          'Fragrance oils are lipophilic — they dissolve into and bind with surface sebum. Higher sebum slows down molecular evaporation and amplifies heavy base notes (amber, resins, musk), while very low sebum lets volatile top notes vanish within 30 minutes.',
        reading:
          score < 70
            ? `Your oiliness score is ${score}/100 (higher surface sebum). Your skin naturally holds fragrance molecules longer, so crisp EDT/EDP formulas (woods, marine, white tea, fig) bloom cleanly without turning heavy, while an oil-balancing primer keeps citrus notes true.`
            : `Your oiliness score is ${score}/100 (balanced-to-low surface sebum). Because there is less excess oil to trap volatiles, pairing your perfume with a lipid-replenishing balm or choosing higher concentrations (EDP/Extrait) will extend wear time.`,
      }

    case 'moisture':
      return {
        title: 'Moisture (Stratum Corneum Hydration)',
        physics:
          'Dehydrated skin absorbs the alcohol carrier too quickly and mutes scent projection (sillage). Well-hydrated skin acts like a smooth diffuser, allowing top, heart, and base notes to unfold in a gradual curve.',
        reading:
          score < 65
            ? `Your moisture score is ${score}/100. Prepping pulse points with an unscented hyaluronic or squalane hydrator before spraying will prevent your skin from absorbing the fragrance base too fast.`
            : `Your moisture score is ${score}/100. Your hydration barrier supports steady scent diffusion from initial spray through the dry-down.`,
      }

    case 'texture':
      return {
        title: 'Texture (Surface Micro-Relief)',
        physics:
          'Uneven epidermal micro-relief increases the surface area exposed to air, causing volatile top notes (bergamot, neroli, herbs) to flash off faster instead of transitioning smoothly into heart and base notes.',
        reading:
          score < 70
            ? `Your texture score is ${score}/100. A smoothing peptide or silicone-free primer veil creates an even surface so top notes evaporate at a controlled pace.`
            : `Your texture score is ${score}/100. Your smooth surface profile helps top and heart notes diffuse evenly without rapid flash-off.`,
      }

    case 'pore':
      return {
        title: 'Pores (Sebaceous Distribution & Diffusion Area)',
        physics:
          'Pore density and visibility reflect active sebaceous zones where skin warmth and lipid output are concentrated, directly influencing how strongly a fragrance projects from the skin.',
        reading:
          score < 70
            ? `Your pore score is ${score}/100, indicating active sebaceous zones that warm and project scent rapidly. Lighter, airy concentrations (EDT/EDP) won't feel overwhelming.`
            : `Your pore score is ${score}/100, indicating a refined surface distribution that gives balanced, close-to-skin scent projection.`,
      }

    case 'radiance':
      return {
        title: 'Radiance (Hydrolipidic Film & Scent Projection)',
        physics:
          'Skin radiance reflects the continuity of your outer hydrolipidic film. A luminous, intact surface keeps aromatic molecules suspended on the skin rather than sinking in, boosting the sillage (trail) of floral, citrus, and white-tea heart notes.',
        reading:
          score < 70
            ? `Your radiance score is ${score}/100. Layering a lightweight squalane or peptide emulsion before applying perfume will restore surface luminosity and help radiant top notes project further.`
            : `Your radiance score is ${score}/100. Your healthy surface reflectivity supports vibrant top-and-heart note projection without muting delicate accords.`,
      }

    case 'redness':
      return {
        title: 'Redness (Barrier Sensitivity & Reactivity)',
        physics:
          'In YouCam API, a high redness score (near 100) indicates a calm barrier, while a lower score indicates sensitivity. Reactive skin can be irritated by high alcohol content in EDTs or warming spice molecules (cardamom, cinnamon).',
        reading:
          score < 70
            ? `Your redness score is ${score}/100 (higher sensitivity). Apply a soothing panthenol or ceramide barrier shield first and favor gentle musks, woods, or lower-alcohol Extrait formulas.`
            : `Your redness score is ${score}/100 (calm, resilient skin barrier). Your skin comfortably tolerates both crisp alcohol-based EDTs and spiced resinous Extraits.`,
      }

    case 'skin_type': {
      const kind = (metric.skin_type ?? 'Normal').toLowerCase()
      const region = metric.region ?? 'whole'

      let physics =
        'Your overall epidermal lipid-to-water ratio is the primary biological factor behind perfume longevity and note balance.'
      if (region === 't_zone') {
        physics =
          'The T-Zone (forehead and nose bridge) has the highest density of sebaceous glands and facial warmth, driving how strongly you perceive your own scent cloud.'
      } else if (region === 'u_zone') {
        physics =
          'The U-Zone (jawline and lower cheeks) directly borders the neck and behind-the-ear pulse points where fragrance is applied — its lipid level dictates real wear time on the neck.'
      }

      let reading =
        'Balanced lipid and water levels allow both fresh EDTs and richer EDPs to develop true to the perfumer’s formula.'

      if (kind.includes('oily')) {
        if (region === 't_zone') {
          reading =
            'An Oily T-Zone generates extra warmth and sebum in the center of the face, which can make heavy sweet or resinous scents feel overwhelming — crisp EDT/EDP profiles stay much fresher.'
        } else if (region === 'u_zone') {
          reading =
            'An Oily U-Zone means the skin along your jawline and neck pulse points is rich in natural lipids, locking in base notes for hours while benefiting from an oil-balancing primer to keep citrus clean.'
        } else {
          reading =
            'Whole-face Oily skin acts as a natural fixative that holds scent longer and intensifies deep base notes, making fresh woody, marine, and botanical EDT/EDP concentrations ideal.'
        }
      } else if (kind.includes('dry')) {
        if (region === 'u_zone') {
          reading =
            'A Dry U-Zone means pulse points near the jawline and neck lack surface lipids, causing top notes to fade fast. Prep neck pulse points with a ceramide balm and choose EDP or Extrait.'
        } else {
          reading =
            'Dry skin lacks the lipid film needed to trap volatile molecules. Higher oil concentrations (EDP/Extrait) and a lipid-replenishing primer will anchor the scent.'
        }
      }

      const zoneLabel = region.replaceAll('_', ' ')
      return {
        title: `Skin Type (${zoneLabel}): ${metric.skin_type ?? 'Normal'}`,
        physics,
        reading,
      }
    }

    default:
      return {
        title: metric.type.replaceAll('_', ' '),
        physics:
          'Visual skin biomarker measured by YouCam Skin AI to contextualize cosmetic and fragrance pairing.',
        reading: `Reported score: ${score}/100.`,
      }
  }
}

export function SkinResults({ metrics }: SkinResultsProps) {
  const filtered = metrics
    .filter((item) => displayedTypes.includes(item.type))
    .sort((a, b) => displayedTypes.indexOf(a.type) - displayedTypes.indexOf(b.type))

  // Prefer oiliness or the first metric with a mask_url so a visible mask shows immediately
  const defaultIndex = Math.max(
    0,
    filtered.findIndex((item) => item.type === 'oiliness' && item.mask_url),
  )

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showMask, setShowMask] = useState(true)

  if (filtered.length === 0) return null

  const overallScore = metrics.find((item) => item.type === 'all')?.score
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
        {typeof overallScore === 'number' && (
          <span className="overall-badge">
            Overall Skin Score: {Math.round(overallScore)} / 100
          </span>
        )}
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
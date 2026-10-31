import { useState } from 'react'

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

    case 'redness':
      return {
        title: 'Redness (Barrier Sensitivity & Reactivity)',
        physics:
          'Reactive or redness-prone skin can be irritated by high alcohol content (common in splashes and EDTs) or warming spice molecules (cardamom, cinnamon, clove).',
        reading:
          score < 70
            ? `Your redness score is ${score}/100 (higher sensitivity). Apply a soothing panthenol or ceramide barrier shield first and favor gentle musks, woods, or lower-alcohol Extrait formulas.`
            : `Your redness score is ${score}/100 (calm skin barrier). Your skin tolerates both crisp alcohol-based EDTs and spiced resinous Extraits well.`,
      }

    case 'skin_type': {
      const kind = (metric.skin_type ?? 'Normal').toLowerCase()
      const zone = metric.region ? ` (${metric.region.replaceAll('_', ' ')})` : ''
      let reading =
        'Balanced lipid and water levels allow both fresh EDTs and richer EDPs to develop true to the perfumer’s formula.'

      if (kind.includes('oily')) {
        reading =
          'Oily skin acts as a natural fixative that holds scent longer and intensifies deep base notes (amber, sandalwood, musk), but can sour delicate citrus unless balanced with a lightweight gel primer. Fresh EDT and EDP concentrations shine here.'
      } else if (kind.includes('dry')) {
        reading =
          'Dry skin lacks the lipid film needed to hold volatile molecules, so top notes fade quickly. Choose richer EDP or Extrait de Parfum (20–30%) with resinous/woody bases and layer over a ceramide or squalane balm.'
      } else if (kind.includes('combination')) {
        reading =
          'Combination skin retains scent differently across zones. Prepping dry pulse points with a moisture veil ensures consistent longevity and projection.'
      }

      return {
        title: `Skin Type${zone}: ${metric.skin_type ?? 'Normal'}`,
        physics:
          'Your overall and regional skin classification determines the lipid-to-water ratio on the epidermis — the primary biological factor behind perfume longevity and note balance.',
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
  const filtered = metrics.filter((item) => displayedTypes.has(item.type))
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (filtered.length === 0) return null

  const safeIndex = selectedIndex < filtered.length ? selectedIndex : 0
  const activeMetric = filtered[safeIndex]
  const insight = getMetricInsight(activeMetric)

  return (
    <section className="panel" aria-live="polite">
      <h2>2. YouCam Skin Metrics</h2>
      <p className="note">
        Click any metric below to see how it influences fragrance evaporation,
        note balance, and longevity on your skin.
      </p>

      <div className="metrics">
        {filtered.map((item, index) => {
          const isActive = index === safeIndex
          return (
            <button
              type="button"
              className={`metric metric-interactive ${isActive ? 'metric-active' : ''}`}
              key={`${item.type}-${item.region ?? index}`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="metric-header">
                <h3>{item.type.replaceAll('_', ' ')}</h3>
                <span className="metric-badge">Why it matters</span>
              </div>
              {item.skin_type && (
                <p className="metric-value">
                  {item.skin_type} {item.region ? `(${item.region})` : ''}
                </p>
              )}
              {typeof item.ui_score === 'number' && (
                <p className="metric-value">Score: {item.ui_score} / 100</p>
              )}
            </button>
          )
        })}
      </div>

      <article className="metric insight-box">
        <p className="notes">Olfactory Physics · {insight.title}</p>
        <p>
          <strong>Why this metric matters:</strong> {insight.physics}
        </p>
        <p>
          <strong>What your reading means:</strong> {insight.reading}
        </p>
      </article>
    </section>
  )
}
import { useState } from 'react'
import './App.css'

const exampleUrl =
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_01_5b5defd339.png'

type Metric = {
  type: string
  ui_score?: number
  raw_score?: number
  skin_type?: string
  region?: string
}

type Fragrance = {
  name: string
  notes: string
  targetMoisture: number
  targetOiliness: number
  skinTypes: string[]
}

const fragranceCatalog: Fragrance[] = [
  {
    name: 'Citrus Atelier',
    notes: 'Bergamot · neroli · cedar',
    targetMoisture: 65,
    targetOiliness: 65,
    skinTypes: ['Oily'],
  },
  {
    name: 'Velvet Amber',
    notes: 'Iris · amber · sandalwood',
    targetMoisture: 45,
    targetOiliness: 40,
    skinTypes: ['Dry', 'Combination'],
  },
  {
    name: 'Quiet Woods',
    notes: 'Fig · soft musk · vetiver',
    targetMoisture: 55,
    targetOiliness: 55,
    skinTypes: [],
  },
]

type FragranceRecommendation = Fragrance & {
  matchScore: number
}

function getFragranceRecommendations(
  metrics: Metric[],
): FragranceRecommendation[] {
  const moisture = metrics.find((item) => item.type === 'moisture')?.ui_score
  const oiliness = metrics.find((item) => item.type === 'oiliness')?.ui_score
  const skinType = metrics.find(
    (item) => item.type === 'skin_type' && item.region === 'whole',
  )?.skin_type

  if (moisture === undefined || oiliness === undefined) return []

  return fragranceCatalog
    .map((fragrance) => {
      const distance =
        (Math.abs(moisture - fragrance.targetMoisture) +
          Math.abs(oiliness - fragrance.targetOiliness)) /
        2
      const skinTypeBonus =
        skinType && fragrance.skinTypes.includes(skinType) ? 10 : 0

      return {
        ...fragrance,
        matchScore: Math.min(
          100,
          Math.max(0, Math.round(100 - distance + skinTypeBonus)),
        ),
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null
}

function getMetrics(value: unknown): Metric[] {
  const results = asRecord(value)?.results
  const output = asRecord(results)?.output
  if (!Array.isArray(output)) return []

  return output.flatMap((item): Metric[] => {
    const row = asRecord(item)
    if (!row || typeof row.type !== 'string') return []

    return [{
      type: row.type,
      ...(typeof row.ui_score === 'number' ? { ui_score: row.ui_score } : {}),
      ...(typeof row.raw_score === 'number' ? { raw_score: row.raw_score } : {}),
      ...(typeof row.skin_type === 'string' ? { skin_type: row.skin_type } : {}),
      ...(typeof row.region === 'string' ? { region: row.region } : {}),
    }]
  })
}

async function readJson(response: Response): Promise<unknown> {
  const data: unknown = await response.json()
  if (!response.ok) {
    const message = asRecord(data)?.error
    throw new Error(typeof message === 'string' ? message : 'Request failed')
  }
  return data
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function App() {
  const [imageUrl, setImageUrl] = useState(exampleUrl)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [metrics, setMetrics] = useState<Metric[]>([])
  const recommendations = getFragranceRecommendations(metrics)

  async function analyze() {
    setLoading(true)
    setMessage('Creating analysis task…')
    setMetrics([])

    try {
      const startResponse = await fetch('/api/skin-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src_file_url: imageUrl }),
      })

      const startData = asRecord(await readJson(startResponse))
      const taskId = startData?.task_id
      if (typeof taskId !== 'string') {
        throw new Error('Server did not return a task_id')
      }

      for (let attempt = 0; attempt < 60; attempt += 1) {
        setMessage(`Analyzing skin… Check ${attempt + 1} of 60`)
        await wait(2000)

        const statusResponse = await fetch(
          `/api/skin-analysis/${encodeURIComponent(taskId)}`,
        )
        const statusData = asRecord(await readJson(statusResponse))
        const status = statusData?.task_status

        if (status === 'success') {
          setMetrics(getMetrics(statusData))
          setMessage('Analysis completed')
          return
        }

        if (status === 'error') {
          throw new Error('YouCam could not process the image')
        }
      }

      throw new Error('Timeout exceeded. Please check the task later.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to execute analysis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">DIAMANDIS · SKIN × SCENT</p>
        <h1>Find the fragrance your skin wears best.</h1>
        <p>Start with a YouCam skin analysis, then explore personalized recommendations.</p>
      </header>

      <section className="panel">
        <label htmlFor="image-url">Public HTTPS URL of the photo</label>
        <input
          id="image-url"
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://example.com/photo.jpg"
        />
        <button disabled={loading || !imageUrl.startsWith('https://')} onClick={analyze}>
          {loading ? 'Analyzing…' : 'Analyze my skin'}
        </button>
        {message && <p role="status">{message}</p>}
      </section>

      {metrics.length > 0 && (
        <section className="panel" aria-live="polite">
          <h2>Skin analysis</h2>
          <p>API metrics — a guide for recommendations, not a medical diagnosis.</p>
          <div className="metrics">
            {metrics
              .filter((item) =>
                ['moisture', 'oiliness', 'skin_type'].includes(item.type),
              )
              .map((item, index) => (
                <article className="metric" key={`${item.type}-${item.region ?? index}`}>
                  <h3>{item.type.replaceAll('_', ' ')}</h3>
                  {item.skin_type && <p>{item.skin_type} · {item.region}</p>}
                  {typeof item.ui_score === 'number' && <p>Score: {item.ui_score}</p>}
                </article>
              ))}
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="panel" aria-live="polite">
          <h2>Fragrance edit</h2>
          <p>
            Editorial suggestions based on your YouCam profile. This is not a
            prediction of fragrance longevity or a medical recommendation.
          </p>

          <div className="metrics">
            {recommendations.map((fragrance) => (
              <article className="metric" key={fragrance.name}>
                <h3>{fragrance.name}</h3>
                <p>{fragrance.notes}</p>
                <p>Editorial profile match: {fragrance.matchScore}/100</p>
              </article>
            ))}
          </div>

          <div>Recommendations use a simple editorial heuristic based on API metrics; they are not scientifically validated fragrance-performance predictions.</div>
        </section>
      )}
    </main>
  )
}

export default App
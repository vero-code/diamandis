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

type FragranceRecommendation = {
  name: string
  notes: string
  reason: string
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

function getRecommendations(value: unknown): FragranceRecommendation[] {
  const rows = asRecord(value)?.recommendations

  if (!Array.isArray(rows)) {
    throw new Error('Gemini response did not include recommendations.')
  }

  return rows.map((row: unknown) => {
    const recommendation = asRecord(row)

    if (
      !recommendation ||
      typeof recommendation.name !== 'string' ||
      typeof recommendation.notes !== 'string' ||
      typeof recommendation.reason !== 'string'
    ) {
      throw new Error('Gemini returned an invalid recommendation.')
    }

    return {
      name: recommendation.name,
      notes: recommendation.notes,
      reason: recommendation.reason,
    }
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
  const [recommendations, setRecommendations] =
  useState<FragranceRecommendation[]>([])
  const [recommendationError, setRecommendationError] = useState('')

  async function analyze() {
    setRecommendations([])
    setRecommendationError('')
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
          const analysisMetrics = getMetrics(statusData)
          setMetrics(analysisMetrics)
          setMessage('Generating fragrance recommendations…')

          try {
            const response = await fetch('/api/fragrance-recommendations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ metrics: analysisMetrics }),
            })

            setRecommendations(getRecommendations(await readJson(response)))
            setMessage('Analysis completed')
          } catch (error) {
            setRecommendationError(
              error instanceof Error
                ? error.message
                : 'Could not generate fragrance recommendations.',
            )
            setMessage('Skin analysis completed, but recommendations are unavailable.')
          }

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
                <p>{fragrance.reason}</p>
              </article>
            ))}
          </div>
          <div>
            Gemini-generated editorial suggestions based on YouCam metrics. They are
            not medical advice or scientifically validated fragrance-performance predictions.
          </div>
          {recommendationError && <p role="alert">{recommendationError}</p>}
        </section>
      )}
    </main>
  )
}

export default App
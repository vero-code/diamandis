import { useState } from 'react'
import './App.css'
import { AnalysisProgress } from './components/AnalysisProgress'
import {
  FragranceRecommendations,
  type CurationResult,
} from './components/FragranceRecommendations'
import { SkinResults, type Metric } from './components/SkinResults'
import { UploadCard, type LocalFilePayload } from './components/UploadCard'
import { MolecularBackground } from './components/MolecularBackground'

const exampleUrl =
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_01_5b5defd339.png'

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

function getCuration(value: unknown): CurationResult {
  const root = asRecord(value)
  const retentionProfile = root?.retentionProfile
  const skinPrep = asRecord(root?.skinPrep)
  const rows = root?.recommendations

  if (
    typeof retentionProfile !== 'string' ||
    !skinPrep ||
    typeof skinPrep.name !== 'string' ||
    typeof skinPrep.focus !== 'string' ||
    typeof skinPrep.reason !== 'string' ||
    !Array.isArray(rows)
  ) {
    throw new Error('Gemini response did not include a valid curation.')
  }

  const recommendations = rows.map((row: unknown) => {
    const item = asRecord(row)
    if (
      !item ||
      typeof item.name !== 'string' ||
      typeof item.concentration !== 'string' ||
      typeof item.notes !== 'string' ||
      typeof item.reason !== 'string'
    ) {
      throw new Error('Gemini returned an invalid recommendation.')
    }

    return {
      name: item.name,
      concentration: item.concentration,
      notes: item.notes,
      reason: item.reason,
    }
  })

  return {
    retentionProfile,
    skinPrep: {
      name: skinPrep.name,
      focus: skinPrep.focus,
      reason: skinPrep.reason,
    },
    recommendations,
  }
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
  const [localFile, setLocalFile] = useState<LocalFilePayload | null>(null)
  const [preference, setPreference] = useState('Fresh citrus and neroli')
  const [consent, setConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasError, setHasError] = useState(false)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [curation, setCuration] = useState<CurationResult | null>(null)
  const [recommendationError, setRecommendationError] = useState('')

  async function analyze() {
    setCuration(null)
    setRecommendationError('')
    setHasError(false)
    setLoading(true)
    setMessage('Creating analysis task…')
    setMetrics([])

    try {
      const startResponse = await fetch('/api/skin-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          localFile
            ? {
                file_name: localFile.fileName,
                content_type: localFile.contentType,
                file_data: localFile.dataUrl,
              }
            : { src_file_url: imageUrl },
        ),
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
              body: JSON.stringify({
                metrics: analysisMetrics,
                preference,
              }),
            })

            setCuration(getCuration(await readJson(response)))
            setMessage('Analysis completed.')
          } catch (error) {
            setRecommendationError(
              error instanceof Error
                ? error.message
                : 'Could not generate fragrance recommendations.',
            )
            setMessage(
              'Skin analysis completed, but recommendations are unavailable.',
            )
          }

          return
        }

        if (status === 'error') {
          throw new Error('YouCam could not process the image.')
        }
      }

      throw new Error('Timeout exceeded. Please try again later.')
    } catch (error) {
      setHasError(true)
      setMessage(
        error instanceof Error ? error.message : 'Failed to execute analysis.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <MolecularBackground />
      <header className="app-header">
        <p className="eyebrow">DIAMANDIS · SKIN × SCENT</p>
        <h1>Skin-Informed Fragrance Selection</h1>
        <p>
          Analyze facial skin metrics via YouCam API and receive editorial
          fragrance suggestions from our catalog.
        </p>
      </header>

      <UploadCard
        imageUrl={imageUrl}
        localFile={localFile}
        preference={preference}
        consent={consent}
        loading={loading}
        onImageUrlChange={setImageUrl}
        onLocalFileChange={setLocalFile}
        onPreferenceChange={setPreference}
        onConsentChange={setConsent}
        onAnalyze={analyze}
      />

      <AnalysisProgress
        loading={loading}
        message={message}
        hasError={hasError}
        onRetry={analyze}
      />

      <SkinResults metrics={metrics} />

      <FragranceRecommendations
        curation={curation}
        error={recommendationError}
      />
    </main>
  )
}

export default App
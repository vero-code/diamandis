import { useEffect, useState } from 'react'
import './App.css'
import { AnalysisProgress } from './components/AnalysisProgress'
import { FragranceRecommendations } from './components/FragranceRecommendations'
import { LegalPage } from './components/LegalPage'
import { MolecularBackground } from './components/MolecularBackground'
import { SkinResults } from './components/SkinResults'
import { UploadCard } from './components/UploadCard'
import { BoutiqueStudio } from './components/BoutiqueStudio'
import {
  DEFAULT_FRAGRANCE_CATALOG,
  SCENT_OPTIONS,
  EXAMPLE_IMAGE_URL,
  FAQ_ITEMS
} from './constants'
import type {
  CatalogFragrance,
  CurationResult,
  LocalFilePayload,
  Metric,
  Page
} from './types'
import {
  asRecord,
  formatYouCamError,
  getCuration,
  getMetrics,
  getPage,
  readJson,
  wait,
} from './utils/api'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

function App() {
  const [customApiKey, setCustomApiKey] = useState('')
  const [catalog, setCatalog] = useState<CatalogFragrance[]>(() => {
    try {
      const saved = localStorage.getItem('diamandis_catalog')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_FRAGRANCE_CATALOG
  })
  const [imageUrl, setImageUrl] = useState(EXAMPLE_IMAGE_URL)
  const [localFile, setLocalFile] = useState<LocalFilePayload | null>(null)
  const [preference, setPreference] = useState(SCENT_OPTIONS[0])
  const [customPerfume, setCustomPerfume] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasError, setHasError] = useState(false)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [curation, setCuration] = useState<CurationResult | null>(null)
  const [recommendationError, setRecommendationError] = useState('')
  const [page, setPage] = useState<Page>(getPage)

  function updateCatalog(next: CatalogFragrance[]) {
    setCatalog(next)
    try {
      localStorage.setItem('diamandis_catalog', JSON.stringify(next))
    } catch {
      // Ignore storage errors
    }
  }

  // Sync page with URL hash
  useEffect(() => {
    const onHashChange = () => {
      setPage(getPage())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  async function analyze() {
    setCuration(null)
    setRecommendationError('')
    setHasError(false)
    setLoading(true)
    setMessage('Creating analysis task…')
    setMetrics([])

    try {
      const youcamHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(customApiKey.trim() ? { 'x-youcam-key': customApiKey.trim() } : {}),
      }
      const startResponse = await fetch('/api/skin-analysis', {
        method: 'POST',
        headers: youcamHeaders,
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
        {
          headers: customApiKey.trim()
            ? { 'x-youcam-key': customApiKey.trim() }
            : {},
        },
      )
        const statusData = asRecord(await readJson(statusResponse))
        const status = statusData?.task_status

        if (status === 'success') {
          const analysisMetrics = getMetrics(statusData)
          setMetrics(analysisMetrics)
          setMessage('')

          try {
            const response = await fetch('/api/fragrance-recommendations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                metrics: analysisMetrics,
                preference,
                customPerfume,
                catalog,
              }),
            })

            setCuration(getCuration(await readJson(response)))
          } catch (error) {
            setRecommendationError(
              error instanceof Error
                ? error.message
                : 'Could not generate fragrance recommendations.',
            )
          }

          return
        }

        if (status === 'error') {
          throw new Error(formatYouCamError(statusData?.error))
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
      <Header page={page} hasCustomKey={Boolean(customApiKey.trim())} />

      {page === 'privacy' || page === 'terms' ? (
        <LegalPage page={page} />
      ) : page === 'studio' ? (
        <BoutiqueStudio
          catalog={catalog}
          customApiKey={customApiKey}
          onCatalogChange={updateCatalog}
          onCustomApiKeyChange={setCustomApiKey}
        />
      ) : (
        <div className="workspace-grid">
          <div className="workspace-left">
            <UploadCard
              imageUrl={imageUrl}
              localFile={localFile}
              preference={preference}
              customPerfume={customPerfume}
              consent={consent}
              loading={loading}
              onImageUrlChange={setImageUrl}
              onLocalFileChange={setLocalFile}
              onPreferenceChange={setPreference}
              onCustomPerfumeChange={setCustomPerfume}
              onConsentChange={setConsent}
              onAnalyze={analyze}
            />
          </div>

          <div className="workspace-right">
            <AnalysisProgress
              loading={loading}
              message={message}
              hasError={hasError}
              onRetry={analyze}
            />

            {!loading &&
            !hasError &&
            metrics.length === 0 &&
            !curation &&
            !recommendationError ? (
              <>
                <section className="panel empty-state-panel">
                  <p className="eyebrow">AWAITING BIOMARKER TELEMETRY</p>
                  <h2>How Skin Chemistry Shapes Scent</h2>
                  <p className="note">
                    Run the analysis on the left to inspect your YouCam AI zone
                    masks and receive a personalized fragrance curation.
                  </p>
                  <div className="metrics">
                    <article className="metric">
                      <p className="notes">Step 01 · YouCam AI</p>
                      <h3>Epidermal Diagnostics</h3>
                      <p>
                        Measures oiliness, moisture, pores, texture, radiance,
                        redness, and facial zones (T-Zone &amp; U-Zone) with
                        visual overlay masks.
                      </p>
                    </article>
                    <article className="metric">
                      <p className="notes">Step 02 · Skin-Prep Base</p>
                      <h3>Barrier &amp; Lipid Primer</h3>
                      <p>
                        Matches an unscented skincare primer to balance surface
                        sebum or lock in hydration on your pulse points.
                      </p>
                    </article>
                    <article className="metric">
                      <p className="notes">Step 03 · Gemini Curation</p>
                      <h3>Perfume Concentration &amp; Notes</h3>
                      <p>
                        Selects three fragrances (EDT, EDP, or Extrait) and explains
                        how their top and base notes bloom and last on your skin.
                      </p>
                    </article>
                  </div>
                </section>

                <section className="panel faq-panel">
                  <p className="eyebrow">FREQUENTLY ASKED QUESTIONS</p>
                  <h2>Skin Chemistry &amp; AI Diagnostics FAQ</h2>
                  <div className="faq-list">
                    {FAQ_ITEMS.map((item) => (
                      <details key={item.question} className="faq-item">
                        <summary>{item.question}</summary>
                        <p>{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <>
                <SkinResults metrics={metrics} />

                {metrics.length > 0 && (
                  <FragranceRecommendations
                    curation={curation}
                    error={recommendationError}
                    loading={loading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

       <Footer />
    </main>
  )
}

export default App
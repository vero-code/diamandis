import { useEffect, useState } from 'react'
import './App.css'
import { AnalysisProgress } from './components/AnalysisProgress'
import { FragranceRecommendations } from './components/FragranceRecommendations'
import { LegalPage } from './components/LegalPage'
import { MolecularBackground } from './components/MolecularBackground'
import { SkinResults } from './components/SkinResults'
import { UploadCard } from './components/UploadCard'
import { SCENT_OPTIONS, EXAMPLE_IMAGE_URL, FAQ_ITEMS } from './constants'
import type { CurationResult, LocalFilePayload, Metric, Page } from './types'
import {
  asRecord,
  formatYouCamError,
  getCuration,
  getMetrics,
  getPage,
  readJson,
  wait,
} from './utils/api'

function App() {
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
                customPerfume,
              }),
            })

            setCuration(getCuration(await readJson(response)))
            setMessage('Analysis and fragrance curation completed.')
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
      <header className="app-header">
        <p className="eyebrow">DIAMANDIS · SKIN × SCENT</p>
        <h1>Skin-Informed Fragrance Selection</h1>
        <p>
          Analyze facial skin metrics via YouCam API and receive editorial
          fragrance suggestions from our catalog.
        </p>
      </header>

      {page !== 'home' ? (
        <LegalPage page={page} />
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

      {page === 'home' && (
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
      )}

      <footer className="app-footer">
        <p>
          © {new Date().getFullYear()} <strong>DIAMANDIS</strong> · Created by 
          <a
            href="https://github.com/vero-code/diamandis"
            target="_blank"
            rel="noreferrer"
          >
            {' '} Veronika Kashtanova
            </a>
        </p>
        <p>
          <a href="#/privacy">Privacy Policy</a> ·{' '}
          <a href="#/terms">Terms of Use</a>
        </p>
      </footer>
    </main>
  )
}

export default App
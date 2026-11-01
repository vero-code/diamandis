import type { ChangeEvent } from 'react'
import { SAMPLE_PORTRAITS, SCENT_OPTIONS } from '../constants'
import type { LocalFilePayload } from '../types'

type UploadCardProps = {
  imageUrl: string
  localFile: LocalFilePayload | null
  preference: string
  customPerfume: string
  consent: boolean
  loading: boolean
  onImageUrlChange: (value: string) => void
  onLocalFileChange: (file: LocalFilePayload | null) => void
  onPreferenceChange: (value: string) => void
  onCustomPerfumeChange: (value: string) => void
  onConsentChange: (checked: boolean) => void
  onAnalyze: () => void
}

export function UploadCard({
  imageUrl,
  localFile,
  preference,
  customPerfume,
  consent,
  loading,
  onImageUrlChange,
  onLocalFileChange,
  onPreferenceChange,
  onCustomPerfumeChange,
  onConsentChange,
  onAnalyze,
}: UploadCardProps) {
  const hasValidSource =
    localFile !== null || imageUrl.startsWith('https://')
  const canSubmit = !loading && consent && hasValidSource
  const previewSrc = localFile
    ? localFile.dataUrl
    : imageUrl.startsWith('https://')
      ? imageUrl
      : ''

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      onLocalFileChange(null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLocalFileChange({
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
          dataUrl: reader.result,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const currentSampleIndex = localFile
    ? -1
    : SAMPLE_PORTRAITS.indexOf(imageUrl)

  function cycleSample(step: number) {
    const baseIndex = currentSampleIndex >= 0 ? currentSampleIndex : 0
    const nextIndex =
      (baseIndex + step + SAMPLE_PORTRAITS.length) % SAMPLE_PORTRAITS.length
    onLocalFileChange(null)
    onImageUrlChange(SAMPLE_PORTRAITS[nextIndex])
  }

  return (
    <section className="panel">
      <h2>1. Photo &amp; Scent Preferences</h2>

      <div className="field">
        <label htmlFor="local-file">
          Or upload your own portrait (JPG or PNG)
        </label>
        <input
          id="local-file"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileInput}
        />
        {localFile && (
          <button type="button" onClick={() => onLocalFileChange(null)}>
            Switch back to sample / URL ({localFile.fileName})
          </button>
        )}
      </div>

      {!localFile && (
        <div className="field">
          <label htmlFor="image-url">Or paste a public HTTPS image URL</label>
          <input
            id="image-url"
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
      )}

      {previewSrc && (
        <div className="preview-box">
          <div className="preview-stage">
            <img
              src={previewSrc}
              alt="Selected portrait preview"
              className="preview-img"
              referrerPolicy="no-referrer"
            />
            <div className="preview-switcher">
              <button
                type="button"
                className="preview-nav-btn"
                onClick={() => cycleSample(-1)}
                title="Previous sample portrait"
              >
                ‹ Prev
              </button>
              <span className="preview-counter">
                {currentSampleIndex >= 0
                  ? `Sample ${currentSampleIndex + 1} / ${SAMPLE_PORTRAITS.length}`
                  : 'Custom Photo'}
              </span>
              <button
                type="button"
                className="preview-nav-btn"
                onClick={() => cycleSample(1)}
                title="Next sample portrait"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="field">
        <div className="label-with-hint">
          <label htmlFor="scent-preference">Preferred scent profile</label>
          <span
            className="info-badge"
            title="Skin-Prep Base is chosen strictly by your skin metrics. Your preferred scent profile guides which 3 perfumes from our catalog Gemini prioritizes for your skin."
          >
            ⓘ How this affects AI
          </span>
        </div>
        <p className="field-hint">
          Guides Step 2 perfume selection while keeping Step 1 skin-prep strictly
          biomarker-driven.
        </p>
        <select
          id="scent-preference"
          value={preference}
          onChange={(e) => onPreferenceChange(e.target.value)}
        >
          {SCENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="custom-perfume">
          Or test a specific perfume you own (optional)
        </label>
        <input
          id="custom-perfume"
          type="text"
          value={customPerfume}
          onChange={(e) => onCustomPerfumeChange(e.target.value)}
          placeholder="e.g., Fabien Marche Elixir de Pitaya"
          maxLength={100}
        />
        <p className="field-hint">
          Gemini will explain how this perfume behaves on your skin and how long
          it will last, plus suggest catalog alternatives.
        </p>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => onConsentChange(e.target.checked)}
        />
        <span>
          I consent to process this photo via the YouCam Skin Analysis API and
          agree to the <a href="#/terms">Terms of Use</a> and{' '}
          <a href="#/privacy">Privacy Policy</a>.
        </span>
      </label>

      <button disabled={!canSubmit} onClick={onAnalyze}>
        {loading ? 'Analyzing Skin & Scent…' : 'Run skin analysis'}
      </button>
    </section>
  )
}
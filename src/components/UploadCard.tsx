import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
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
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url')
  const [savedFile, setSavedFile] = useState<LocalFilePayload | null>(localFile)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const hasValidSource =
    inputMode === 'upload'
      ? savedFile !== null
      : imageUrl.startsWith('https://')
  const canSubmit = !loading && consent && hasValidSource

  const previewSrc =
    inputMode === 'upload'
      ? savedFile?.dataUrl ?? ''
      : imageUrl.startsWith('https://')
        ? imageUrl
        : ''

  function processFile(file: File | undefined) {
    if (!file) return
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const payload: LocalFilePayload = {
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
          dataUrl: reader.result,
        }
        setSavedFile(payload)
        onLocalFileChange(payload)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    processFile(e.target.files?.[0])
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }

  const currentSampleIndex = SAMPLE_PORTRAITS.indexOf(imageUrl)

  function cycleSample(step: number) {
    const baseIndex = currentSampleIndex >= 0 ? currentSampleIndex : 0
    const nextIndex =
      (baseIndex + step + SAMPLE_PORTRAITS.length) % SAMPLE_PORTRAITS.length
    onImageUrlChange(SAMPLE_PORTRAITS[nextIndex])
  }

  return (
    <section className="panel">
      <h2>Photo &amp; Scent Preferences</h2>

      <div className="source-tabs" role="tablist" aria-label="Photo source">
        <button
          type="button"
          className={`source-tab ${inputMode === 'url' ? 'source-tab-active' : ''}`}
          onClick={() => {
            setInputMode('url')
            onLocalFileChange(null)
          }}
        >
          Image URL
        </button>
        <button
          type="button"
          className={`source-tab ${inputMode === 'upload' ? 'source-tab-active' : ''}`}
          onClick={() => {
            setInputMode('upload')
            onLocalFileChange(savedFile)
          }}
        >
          Upload Portrait
        </button>
      </div>

      {inputMode === 'url' ? (
        <div className="field">
          <label htmlFor="image-url">Paste a public HTTPS image URL</label>
          <input
            id="image-url"
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
      ) : (
        <div className="field">
          <label htmlFor="local-file">Upload your own portrait (JPG or PNG)</label>
          <input
            ref={fileInputRef}
            id="local-file"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInput}
          />
        </div>
      )}

      {inputMode === 'url' ? (
        previewSrc && (
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
                    : 'Custom URL'}
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
        )
      ) : (
        <div
          className={`preview-box dropzone-box ${isDragging ? 'dropzone-active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewSrc ? (
            <div className="preview-stage">
              <img
                src={previewSrc}
                alt="Uploaded portrait preview"
                className="preview-img"
              />
            </div>
          ) : (
            <div className="dropzone-placeholder">
              <p className="dropzone-title">Drag &amp; drop portrait here</p>
              <p className="field-hint">or click to choose JPG / PNG</p>
            </div>
          )}
        </div>
      )}
      <p className="field-hint">
        YouCam Skin AI analyzes visible skin traits that affect how fragrance lasts.
        Use a front-facing photo in even light.
      </p>

      <div className="field">
        <div className="label-with-hint">
          <label htmlFor="scent-preference">Preferred scent profile</label>
        </div>
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
        <p className="field-hint">
          Perfume picks balance this profile with your skin metrics. Skin-prep is based on skin metrics only.
        </p>
      </div>

      <div className="field">
        <label htmlFor="custom-perfume">
          Test a specific perfume
        </label>
        <input
          id="custom-perfume"
          type="text"
          value={customPerfume}
          onChange={(e) => onCustomPerfumeChange(e.target.value)}
          placeholder="e.g., Elixir de Pitaya"
          maxLength={100}
        />
        <p className="field-hint">
          Find out how this perfume behaves on your skin and how long
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
        {loading ? 'Analyzing Skin & Scent…' : 'Run analysis'}
      </button>
    </section>
  )
}
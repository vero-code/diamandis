import type { ChangeEvent } from 'react'

export type LocalFilePayload = {
  fileName: string
  contentType: string
  dataUrl: string
}

type UploadCardProps = {
  imageUrl: string
  localFile: LocalFilePayload | null
  preference: string
  consent: boolean
  loading: boolean
  onImageUrlChange: (value: string) => void
  onLocalFileChange: (file: LocalFilePayload | null) => void
  onPreferenceChange: (value: string) => void
  onConsentChange: (checked: boolean) => void
  onAnalyze: () => void
}

const scentOptions = [
  'Fresh citrus and neroli',
  'Warm amber and sandalwood',
  'Soft musk, fig, and vetiver',
  'Marine mineral and sage',
  'White tea and jasmine',
  'Spiced cardamom and smoked cedar',
]

export function UploadCard({
  imageUrl,
  localFile,
  preference,
  consent,
  loading,
  onImageUrlChange,
  onLocalFileChange,
  onPreferenceChange,
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

  return (
    <section className="panel">
      <h2>1. Photo & Preferences</h2>

      <div className="field">
        <label htmlFor="local-file">Upload a photo from your computer (JPG or PNG)</label>
        <input
          id="local-file"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileInput}
        />
        {localFile && (
          <button
            type="button"
            onClick={() => onLocalFileChange(null)}
          >
            Use URL instead ({localFile.fileName})
          </button>
        )}
      </div>

      {!localFile && (
        <div className="field">
          <label htmlFor="image-url">Or enter a public HTTPS URL of the photo</label>
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
          <img src={previewSrc} alt="Selected portrait preview" className="preview-img" />
        </div>
      )}

      <div className="field">
        <label htmlFor="scent-preference">Preferred scent profile</label>
        <select
          id="scent-preference"
          value={preference}
          onChange={(e) => onPreferenceChange(e.target.value)}
        >
          {scentOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => onConsentChange(e.target.checked)}
        />
        <span>
          I consent to process this photo via the YouCam Skin Analysis API.
        </span>
      </label>

      <button disabled={!canSubmit} onClick={onAnalyze}>
        {loading ? 'Analyzing…' : 'Run skin analysis'}
      </button>
    </section>
  )
}
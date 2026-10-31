type UploadCardProps = {
  imageUrl: string
  preference: string
  consent: boolean
  loading: boolean
  onImageUrlChange: (value: string) => void
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
  preference,
  consent,
  loading,
  onImageUrlChange,
  onPreferenceChange,
  onConsentChange,
  onAnalyze,
}: UploadCardProps) {
  const canSubmit = !loading && consent && imageUrl.startsWith('https://')

  return (
    <section className="panel">
      <h2>1. Photo & Preferences</h2>

      <div className="field">
        <label htmlFor="image-url">Public HTTPS URL of the photo</label>
        <input
          id="image-url"
          type="url"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      {imageUrl.startsWith('https://') && (
        <div className="preview-box">
          <img src={imageUrl} alt="Selected portrait preview" className="preview-img" />
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
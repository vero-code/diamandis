type AnalysisProgressProps = {
  loading: boolean
  message: string
  hasError: boolean
  onRetry: () => void
}

export function AnalysisProgress({
  loading,
  message,
  hasError,
  onRetry,
}: AnalysisProgressProps) {
  if (!message) return null

  return (
    <section
      className={`panel status-panel ${loading ? 'status-panel-loading' : ''} ${hasError ? 'status-panel-error' : ''}`}
      aria-live="polite"
    >
      <div className="status-row">
        {loading && <span className="spinner" aria-hidden="true" />}
        <p role={hasError ? 'alert' : 'status'} className="status-text">
          {message}
        </p>
      </div>
      {loading && (
        <div className="progress-bar-track" aria-hidden="true">
          <div className="progress-bar-fill" />
        </div>
      )}
      {hasError && !loading && (
        <button type="button" onClick={onRetry}>
          Retry analysis
        </button>
      )}
    </section>
  )
}
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
    <section className="panel status-panel" aria-live="polite">
      <p role={hasError ? 'alert' : 'status'}>{message}</p>
      {hasError && !loading && (
        <button type="button" onClick={onRetry}>
          Retry analysis
        </button>
      )}
    </section>
  )
}
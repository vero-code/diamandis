import { FAQ_ITEMS } from '../constants'

type FaqSectionProps = {
  compactTitle?: boolean
}

export function FaqSection({ compactTitle = false }: FaqSectionProps) {
  return (
    <details className="panel faq-panel">
      <summary className="faq-panel-summary">
      <div className="faq-panel-title">
        <p className="eyebrow">QUESTIONS &amp; ANSWERS</p>
        <h2>{compactTitle ? 'Skin & AI FAQ' : 'Skin Chemistry & AI Diagnostics FAQ'}</h2>
      </div>
      <span className="faq-toggle-badge" aria-hidden="true">
        FAQ List ▾
      </span>
      </summary>

      <div className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="faq-item">
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </details>
  )
}
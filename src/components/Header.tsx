import type { Page } from '../types';

type HeaderProps = {
  page: Page;
  hasCustomKey: boolean;
};

export function Header({ page, hasCustomKey }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-navbar">
        <a href="#/" className="brand-mark">
          <img src="/logo.png" alt="Diamandis emblem" className="brand-logo" />
          <span className="brand-name">DIAMANDIS</span>
        </a>

        <div className="header-tech-badge">
          <span>YouCam Skin AI</span>
          <span className="tech-dot">·</span>
          <span>Google Gemini</span>
        </div>

        <nav className="mode-nav" aria-label="Application mode">
          <a href="#/" className={`mode-link ${page === 'home' ? 'mode-link-active' : ''}`}>
            🛍 Shopper View
          </a>
          <a href="#/studio" className={`mode-link ${page === 'studio' ? 'mode-link-active' : ''}`}>
            🏛 Boutique &amp; Judge Studio
            {hasCustomKey ? ' (Custom Key)' : ''}
          </a>
        </nav>
      </div>

      <div className="header-hero">
        <p className="eyebrow">SKIN BIOLOGY × OLFACTORY CHEMISTRY</p>
        <h1>Skin-Informed Fragrance Selection</h1>
        <p className="header-desc">
          Diagnose facial biomarkers with YouCam Skin AI to understand fragrance evaporation,
          longevity, and curated pulse-point layering.
        </p>
      </div>
    </header>
  );
}

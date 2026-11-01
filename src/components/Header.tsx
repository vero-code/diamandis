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
          <div className="brand-text">
            <span className="brand-name">DIAMANDIS</span>
            <p className="eyebrow">SKIN BIOLOGY × OLFACTORY CHEMISTRY</p>
          </div>
        </a>

        <div className="header-hero">
          <h1>Skin-Informed Fragrance Selection</h1>
          <p className="header-desc">
            Diagnose facial biomarkers with YouCam Skin AI to understand fragrance evaporation,
            longevity, and curated pulse-point layering. Powered by YouCam Skin AI & Gemini.
          </p>
        </div>

        <nav className="mode-nav" aria-label="Application mode">
          <a href="#/" className={`mode-link ${page === 'home' ? 'mode-link-active' : ''}`}>
            🛍 Shopper
          </a>
          <a href="#/studio" className={`mode-link ${page === 'studio' ? 'mode-link-active' : ''}`}>
            🏛 Boutique
            {hasCustomKey ? ' (Custom Key)' : ''}
          </a>
        </nav>
      </div>

      
    </header>
  );
}
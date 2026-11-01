import '../styles/header.css';
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
            <h1>DIAMANDIS</h1>
            <p className="eyebrow">SKIN BIOLOGY × OLFACTORY CHEMISTRY</p>
          </div>
        </a>

        <div className="header-hero-inline">
          <h2>Skin-Informed Fragrance Selection</h2>
          <span className="hero-sep">—</span>
          <p className="header-desc">
            Analyze facial biomarkers with YouCam Skin AI to understand fragrance evaporation,
            longevity, and curated pulse-point layering powered by Gemini.
          </p>
        </div>

        <nav className="mode-nav" aria-label="Application mode">
          <a href="#/" className={`mode-link ${page === 'home' ? 'mode-link-active' : ''}`}>
            Shopper
          </a>
          <a href="#/studio" className={`mode-link ${page === 'studio' ? 'mode-link-active' : ''}`}>
            Boutique
            {hasCustomKey ? ' (Custom Key)' : ''}
          </a>
        </nav>
      </div>
    </header>
  );
}
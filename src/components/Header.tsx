import { useState } from 'react';
import '../styles/header.css';
import type { Page } from '../types';

type HeaderProps = {
  page: Page;
  hasCustomKey: boolean;
  bagItems?: string[];
  onClearBag?: () => void;
};

export function Header({ page, bagItems = [], onClearBag }: HeaderProps) {
  const [isBagOpen, setIsBagOpen] = useState(false);

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
            longevity, and curated pulse-point layering.
          </p>
        </div>

        <nav className="mode-nav" aria-label="Application mode">
          <a href="#/" className={`mode-link ${page === 'home' ? 'mode-link-active' : ''}`}>
            Shopper
          </a>
          <a href="#/studio" className={`mode-link ${page === 'studio' ? 'mode-link-active' : ''}`}>
            Boutique
          </a>

          {/* Bag Dropdown */}
          <div className="header-bag-wrapper">
            <button
              type="button"
              className={`mode-link header-bag-btn ${bagItems.length > 0 ? 'header-bag-btn-active' : ''}`}
              onClick={() => setIsBagOpen((prev) => !prev)}
              aria-label={`Shopping bag, ${bagItems.length} items`}
              title="Shopping Bag"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {bagItems.length > 0 && <span className="bag-count">{bagItems.length}</span>}
            </button>
            {isBagOpen && (
              <div className="header-bag-dropdown">
                <div className="bag-dropdown-header">
                  <strong>Curated Bag</strong>
                  {bagItems.length > 0 && (
                    <button type="button" className="bag-clear-btn" onClick={onClearBag}>
                      Clear
                    </button>
                  )}
                </div>
                {bagItems.length === 0 ? (
                  <p className="bag-empty">Your shopping bag is empty. Add recommended flacons below.</p>
                ) : (
                  <ul className="bag-list">
                    {bagItems.map((item, idx) => (
                      <li key={`${item}-${idx}`} className="bag-item">
                        <span>{item}</span>
                        <span className="bag-item-size">50ml Flacon</span>
                      </li>
                    ))}
                  </ul>
                )}
                {bagItems.length > 0 && (
                  <button
                    type="button"
                    className="bag-checkout-btn"
                    onClick={() => {
                      alert('Checkout simulated: In production, orders route directly to the partner boutique.');
                      setIsBagOpen(false);
                    }}
                  >
                    Checkout ({bagItems.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
import { useState, type FormEvent } from 'react';
import { DEFAULT_FRAGRANCE_CATALOG } from '../constants';
import type { CatalogFragrance } from '../types';
import { asRecord, readJson } from '../utils/api';
import { ProductVisual } from './ProductVisual';

type BoutiqueStudioProps = {
  catalog: CatalogFragrance[];
  customApiKey: string;
  onCatalogChange: (next: CatalogFragrance[]) => void;
  onCustomApiKeyChange: (key: string) => void;
};

const CONCENTRATION_OPTIONS = [
  'Eau de Toilette (EDT · 14%)',
  'Eau de Parfum (EDP · 20%)',
  'Extrait de Parfum (28%)',
];

export function BoutiqueStudio({
  catalog,
  customApiKey,
  onCatalogChange,
  onCustomApiKeyChange,
}: BoutiqueStudioProps) {
  const [name, setName] = useState('');
  const [concentration, setConcentration] = useState(CONCENTRATION_OPTIONS[1]);
  const [topNotes, setTopNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');
  const [creditStatus, setCreditStatus] = useState('');
  const [checkingKey, setCheckingKey] = useState(false);

  function handleAddFragrance(e: FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanTop = topNotes.trim();
    const cleanBase = baseNotes.trim();
    if (!cleanName || !cleanTop || !cleanBase) return;

    const updated: CatalogFragrance[] = [
      ...catalog.filter((item) => item.name.toLowerCase() !== cleanName.toLowerCase()),
      {
        name: cleanName,
        concentration,
        notes: `Top: ${cleanTop} · Base: ${cleanBase}`,
      },
    ];
    onCatalogChange(updated);
    setName('');
    setTopNotes('');
    setBaseNotes('');
  }

  function handleRemove(targetName: string) {
    if (catalog.length <= 3) return;
    onCatalogChange(catalog.filter((item) => item.name !== targetName));
  }

  async function handleVerifyKey() {
    setCheckingKey(true);
    setCreditStatus('Checking YouCam API key balance…');
    try {
      const response = await fetch('/api/youcam-credits', {
        headers: customApiKey.trim() ? { 'x-youcam-key': customApiKey.trim() } : {},
      });
      const data = asRecord(await readJson(response));
      const units = data?.units;
      setCreditStatus(
        typeof units === 'number'
          ? `✓ Valid YouCam API Key · ${units.toLocaleString()} units available`
          : '✓ Valid YouCam API Key connected',
      );
    } catch (error) {
      setCreditStatus(error instanceof Error ? `✕ ${error.message}` : '✕ Key check failed');
    } finally {
      setCheckingKey(false);
    }
  }

  return (
    <div className="studio-layout">
      <section className="panel">
        <p className="eyebrow">HACKATHON JUDGE &amp; API SETTINGS</p>
        <h2>Bring Your Own YouCam Skin AI Key</h2>
        <p className="note">
          Leave blank to use the server’s default key, or paste your own Perfect Corp. YouCam API
          Bearer token to test with your account.
        </p>

        <div className="field">
          <label htmlFor="judge-api-key">YouCam API Key Override (Optional)</label>
          <input
            id="judge-api-key"
            type="password"
            value={customApiKey}
            onChange={(e) => onCustomApiKeyChange(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
          />
          <p className="field-hint">
            Stored only in your browser state for this session and sent via the
            <code> x-youcam-key </code> request header.
          </p>
        </div>

        <div className="studio-actions">
          <button type="button" onClick={handleVerifyKey} disabled={checkingKey}>
            {checkingKey ? 'Checking Key…' : 'Verify Key & Check Balance (0 Units)'}
          </button>
          {customApiKey && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                onCustomApiKeyChange('');
                setCreditStatus('');
              }}
            >
              Revert to Default Server Key
            </button>
          )}
        </div>

        {creditStatus && <p className="status-text">{creditStatus}</p>}
      </section>

      <section className="panel">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">MERCHANT BOUTIQUE PORTAL</p>
            <h2>Fragrance Catalog Manager ({catalog.length} Perfumes)</h2>
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => onCatalogChange(DEFAULT_FRAGRANCE_CATALOG)}
          >
            Reset Default Catalog
          </button>
        </div>

        <p className="note">
          Add your brand’s perfumes below. When shoppers run a skin analysis, Gemini curates the top
          3 matches directly from this active catalog.
        </p>

        <form className="studio-form" onSubmit={handleAddFragrance}>
          <div className="studio-form-grid">
            <div className="field">
              <label htmlFor="perfume-name">Perfume Name</label>
              <input
                id="perfume-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Elixir de Pitaya"
                maxLength={60}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="perfume-conc">Concentration</label>
              <select
                id="perfume-conc"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
              >
                {CONCENTRATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="perfume-top">Top Notes (Volatile)</label>
              <input
                id="perfume-top"
                type="text"
                value={topNotes}
                onChange={(e) => setTopNotes(e.target.value)}
                placeholder="e.g., Dragonfruit, bergamot"
                maxLength={80}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="perfume-base">Base Notes (Fixative)</label>
              <input
                id="perfume-base"
                type="text"
                value={baseNotes}
                onChange={(e) => setBaseNotes(e.target.value)}
                placeholder="e.g., White amber, skin musk"
                maxLength={80}
                required
              />
            </div>
          </div>

          <button type="submit">+ Add Fragrance to Boutique Catalog</button>
        </form>

        <div className="metrics">
          {catalog.map((item) => (
            <article className="metric fragrance-card" key={item.name}>
              <ProductVisual
                name={item.name}
                variant="perfume"
                concentration={item.concentration}
              />
              <h3>{item.name}</h3>
              <p className="notes">{item.concentration}</p>
              <p className="fragrance-notes">{item.notes}</p>
              {catalog.length > 3 && (
                <button
                  type="button"
                  className="mask-toggle-btn"
                  onClick={() => handleRemove(item.name)}
                >
                  Remove from Catalog
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

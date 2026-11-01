# Diamandis · Skin-Informed Fragrance Selection

Diamandis connects facial skin diagnostics from the **Perfect Corp. YouCam Skin Analysis API** with editorial fragrance curation powered by **Google Gemini**.

## How It Works

1. **Photo Input & Consent:** Upload a local portrait photo (JPG/PNG via the YouCam S2S v2.0 File API) or provide a public HTTPS image URL, and select a preferred scent profile.
2. **YouCam Skin Analysis (`v2.1`):** The Express server creates an asynchronous task at `/s2s/v2.1/task/skin-analysis` and polls for completion, extracting `moisture`, `oiliness`, `texture`, and regional `skin_type` (`whole`, `t_zone`, `u_zone`).
3. **Editorial Fragrance Curation:** The backend passes the returned skin metrics and user scent preference to Gemini to select up to 3 fragrances from the Diamandis catalog with transparent, non-medical explanations.

> **Disclaimer:** Skin metrics and fragrance suggestions are provided for editorial and shopping reference only. They are not medical diagnoses and do not scientifically measure or guarantee fragrance longevity.

## How "Preferred Scent Profile" vs. Skin Metrics Influences the AI

Diamandis separates skincare chemistry from personal olfactory taste so recommendations stay both scientifically grounded and wearable:

- **Step 1 · Skin-Prep Layering Base (`skinPrep`):** Determined **100% by your YouCam skin metrics** (`oiliness`, `moisture`, `texture`, `pore`, `redness`, and facial zones). It does **not** depend on your chosen scent preference. For example, high sebum (`oiliness < 70`) selects the *Oil-Balancing Niacinamide Gel Primer*, while low hydration selects the *Ceramide & Squalane Lipid Balm*.
- **Step 2 · Curated Perfumes (`recommendations`):** Bridges your **Preferred Scent Profile** with your **Skin Scent Retention Profile**. Gemini prioritizes catalog fragrances that match your chosen notes (e.g., *Citrus Atelier* for *Fresh citrus and neroli*, or *Quiet Woods* for *Soft musk, fig, and vetiver*) while selecting concentrations (`EDT`, `EDP`, `Extrait`) and base notes that hold best on your skin type and estimating wear-time longevity in hours.
- **Personal Bottle Check (Optional):** If you enter a specific perfume you already own (e.g., *Elixir de Pitaya*), Gemini evaluates how its note pyramid interacts with your measured skin biomarkers and how to prep your pulse points before spraying.

## Prerequisites

- Node.js 18+
- A Perfect Corp. YouCam API key (`PERFECTCORP_API_KEY`)
- A Google Gemini API key (`GEMINI_API_KEY`)

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `server/.env` from `server/.env.example` and fill in your keys:
   ```env
   PERFECTCORP_API_KEY=your_youcam_api_key
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Start the backend server (runs on `http://localhost:3001`):
   ```bash
   npm run server
   ```

4. In a second terminal, start the Vite frontend (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
export const baseUrl =
  'https://yce-api-01.makeupar.com/s2s/v2.1/task/skin-analysis'

export const fileApiUrl =
  'https://yce-api-01.makeupar.com/s2s/v2.0/file/skin-analysis'

export const dstActions = [
  'acne',
  'dark_circle_v2',
  'droopy_lower_eyelid',
  'droopy_upper_eyelid',
  'eye_bag',
  'firmness',
  'moisture',
  'oiliness',
  'pore',
  'radiance',
  'redness',
  'age_spot',
  'texture',
  'wrinkle',
  'skin_type',
  'tear_trough',
]

export const fragranceCatalog = [
  {
    name: 'Citrus Atelier',
    concentration: 'Eau de Toilette (EDT · 12%)',
    notes: 'Top: Bergamot, neroli · Base: Dry cedar',
  },
  {
    name: 'Velvet Amber',
    concentration: 'Extrait de Parfum (28%)',
    notes: 'Top: Powdery iris · Base: Labdanum amber, sandalwood',
  },
  {
    name: 'Quiet Woods',
    concentration: 'Eau de Parfum (EDP · 18%)',
    notes: 'Top: Green fig · Base: Soft skin musk, vetiver',
  },
  {
    name: 'Marine Mineral',
    concentration: 'Eau de Toilette (EDT · 14%)',
    notes: 'Top: Sea salt, clary sage · Base: Mineral driftwood',
  },
  {
    name: 'Botanical Veil',
    concentration: 'Eau de Parfum (EDP · 20%)',
    notes: 'Top: White tea, jasmine · Base: Cashmere wood',
  },
  {
    name: 'Spiced Resin',
    concentration: 'Extrait de Parfum (30%)',
    notes: 'Top: Crushed cardamom · Base: Benzoin resin, smoked cedar',
  },
]

export const skinPrepCatalog = [
  {
    name: 'Ceramide & Squalane Lipid Balm',
    focus: 'Dry skin or low moisture · Locks in volatile top notes',
  },
  {
    name: 'Oil-Balancing Niacinamide Gel Primer',
    focus: 'Oily or high-sebum skin · Keeps crisp top notes clean and true',
  },
  {
    name: 'Hyaluronic & Peptide Smoothing Veil',
    focus: 'Combination skin or uneven texture/pores · Even scent diffusion',
  },
  {
    name: 'Panthenol & Cica Barrier Shield',
    focus: 'Sensitivity or redness · Alcohol-buffering protective layer',
  },
]

export const allowedMetricTypes = new Set([
  'moisture',
  'oiliness',
  'skin_type',
  'texture',
  'pore',
  'redness',
  'radiance',
])

// Gemini
const geminiModel = "gemini-3.8-flash"

export const geminiApiUrl =
  `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`

export const geminiResponseSchema = {
  type: 'OBJECT',
  properties: {
    retentionProfile: { type: 'STRING' },
    skinPrepName: { type: 'STRING' },
    prepReason: { type: 'STRING' },
    customPerfumeAnalysis: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING' },
        longevity: { type: 'STRING' },
        verdict: { type: 'STRING' },
      },
      required: ['name', 'longevity', 'verdict'],
    },
    recommendations: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          longevity: { type: 'STRING' },
          reason: { type: 'STRING' },
        },
        required: ['name', 'longevity', 'reason'],
      },
    },
  },
  required: [
    'retentionProfile',
    'skinPrepName',
    'prepReason',
    'recommendations',
  ],
}

export function buildGeminiPrompt(
  metrics: unknown[],
  preference: string,
  customPerfume = '',
): string {
  return [
    'You are a perfumery and skincare formulation advisor for Diamandis.',
    'Important: In YouCam API, ui_score is a 0-100 skin health score where 100 is optimal/calm and lower scores indicate a stronger concern (e.g., redness 97 means very calm skin with no redness, while oiliness 65 and moisture 65 are moderate concerns).',
    '- Oily / higher sebum skin naturally retains lipophilic fragrance molecules longer and amplifies heavy base notes (amber, resins, musk), so lighter EDT/EDP concentrations and crisp wood/mineral/tea/fig profiles bloom cleanly without becoming cloying, while pure citrus benefits from an oil-balancing primer.',
    '- Dry / lower moisture or low-oiliness skin lets volatile top notes evaporate rapidly, so higher concentrations (EDP/Extrait) with fixative base notes (amber, sandalwood, resins, musk) and a lipid-replenishing skin-prep balm help anchor the scent.',
    'Tasks:',
    '1. Write a concise retentionProfile (2 sentences max) explaining how this specific skin profile (citing actual scores and skin_type) interacts with top/base notes and which perfume concentrations work best.',
    '2. Pick the single best skinPrep from the SkinPrepCatalog based strictly on the skin metrics (NOT the scent preference) and explain why in prepReason.',
    customPerfume
      ? `3. The user also asked to test their own perfume: "${customPerfume}". Fill customPerfumeAnalysis with its name, estimated longevity on this skin (e.g., "5-7 hours on oily skin"), and a 2-sentence verdict explaining how its note profile will behave on their skin metrics and how the chosen SkinPrep helps.`
      : '3. Do not include customPerfumeAnalysis or leave its fields empty if no user perfume was provided.',
    '4. Recommend 3 fragrances from the FragranceCatalog that best bridge the user scent preference AND this skin retention profile. For each, provide an estimated wear-time in longevity (e.g., "7–9 hours") and explain in reason both how the notes bloom and why it lasts that long on this skin.',
    'Do not make clinical or medical disease claims.',
    `User scent preference: ${preference || 'No specific preference'}`,
    `User specific perfume to test: ${customPerfume || 'None'}`,
    `Skin metrics: ${JSON.stringify(metrics)}`,
    `SkinPrepCatalog: ${JSON.stringify(skinPrepCatalog)}`,
    `FragranceCatalog: ${JSON.stringify(fragranceCatalog)}`,
  ].join('\n')
}
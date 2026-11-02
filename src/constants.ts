import type { CatalogFragrance } from './types'

export const SAMPLE_PORTRAITS = [
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_01_5b5defd339.png',
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_02_875f3b51a3.png',
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_03_b1d98441a6.png',
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_04_1b6339716b.png',
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_05_d6671299a6.png',
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_06_c9136eea8f.png',
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_07_b847f111df.png',
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_08_672d34078f.png',
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_09_a0efc29e3e.png',
]

export const EXAMPLE_IMAGE_URL = SAMPLE_PORTRAITS[0]

export const SCENT_OPTIONS = [
  'Fresh citrus and neroli',
  'Warm amber and sandalwood',
  'Soft musk, fig, and vetiver',
  'Marine mineral and sage',
  'White tea and jasmine',
  'Spiced cardamom and smoked cedar',
]

export const METRIC_ORDER = [
  'moisture',
  'oiliness',
  'texture',
  'pore',
  'radiance',
  'redness',
  'skin_type',
]

export const FAQ_ITEMS = [
  {
    question: 'Why analyze facial skin if fragrance is applied to pulse points?',
    answer:
      'Facial epidermis (specifically T-zone and U-zone biomarkers) serves as an accurate non-invasive proxy for your systemic lipid production and stratum corneum hydration. Diamandis uses these diagnostic metrics to prescribe the ideal pulse-point priming base before fragrance application.',
  },
  {
    question: 'How does “Preferred scent profile” interact with my skin metrics?',
    answer:
      'Step 1 is selected strictly from your YouCam skin biomarkers (moisture, oiliness, texture, pores, radiance, redness, skin type) and ignores scent taste. Step 2 and 3 bridges both: Gemini selects catalog fragrances that match your olfactory preference while suiting your skin’s retention profile.',
  },
  {
    question: 'Can I test a perfume I already own?',
    answer:
      'Yes! Enter any perfume name in the optional “Or test a specific perfume you own” field. Diamandis will analyze how its likely note structure behaves on your specific skin metrics, estimate wear time, and advise how to layer it with your Skin-Prep Base.',
  },
  {
    question: 'What happens if I upload a photo without a clear face?',
    answer:
      'The YouCam Skin Analysis AI requires a single, well-lit, front-facing face. If no face is detected, multiple people are in frame, or the angle is too extreme, the API stops and prompts you to try a clear portrait.',
  },
]

export const DEFAULT_FRAGRANCE_CATALOG: CatalogFragrance[] = [
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

export const EXAMPLE_IMAGE_URL =
  'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_01_5b5defd339.png'

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
    question: 'How does skin chemistry affect perfume longevity and note projection?',
    answer:
      'Fragrance molecules are lipophilic — they bind to epidermal sebum. Higher-sebum (oily) skin anchors base notes longer and amplifies warm accords, whereas dry or dehydrated skin lets volatile top notes flash off rapidly unless prepped with a lipid or humectant barrier.',
  },
  {
    question: 'How does “Preferred scent profile” interact with my skin metrics?',
    answer:
      'Step 1 (Skin-Prep Layering Base) is selected strictly from your YouCam skin biomarkers (oiliness, moisture, texture, pores, redness) and ignores scent taste. Step 2 (Curated Perfumes) bridges both: Gemini selects catalog fragrances that match your olfactory preference while suiting your skin’s retention profile.',
  },
  {
    question: 'Can I test a perfume I already own (e.g., Fabien Marche Elixir de Pitaya)?',
    answer:
      'Yes! Enter any perfume name in the optional “Or test a specific perfume you own” field. Gemini will analyze how its likely note structure behaves on your specific skin metrics, estimate wear time, and advise how to layer it with your Skin-Prep Base.',
  },
  {
    question: 'What happens if I upload a photo without a clear face?',
    answer:
      'The YouCam Skin Analysis AI requires a single, well-lit, front-facing face. If no face is detected (error_no_face), multiple people are in frame (error_multiple_people), or the angle is too extreme, the API stops and prompts you to try a clear portrait.',
  },
]

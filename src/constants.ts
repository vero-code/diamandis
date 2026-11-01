export const SAMPLE_PORTRAITS = [
  {
    id: '01',
    label: 'Sample 1',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/thumbnail_skin_analysis_01_5b5defd339.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_01_5b5defd339.png',
  },
  {
    id: '02',
    label: 'Sample 2',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/thumbnail_skin_analysis_02_875f3b51a3.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_02_875f3b51a3.png',
  },
  {
    id: '03',
    label: 'Sample 3',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/thumbnail_skin_analysis_03_b1d98441a6.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_03_b1d98441a6.png',
  },
  {
    id: '04',
    label: 'Sample 4',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/thumbnail_skin_analysis_04_1b6339716b.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_04_1b6339716b.png',
  },
  {
    id: '05',
    label: 'Sample 5',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/thumbnail_skin_analysis_05_d6671299a6.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_05_d6671299a6.png',
  },
  {
    id: '06',
    label: 'Sample 6',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/thumbnail_skin_analysis_06_c9136eea8f.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_06_c9136eea8f.png',
  },
  {
    id: '07',
    label: 'Sample 7',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/small_skin_analysis_07_b847f111df.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_07_b847f111df.png',
  },
  {
    id: '08',
    label: 'Sample 8',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/small_skin_analysis_08_672d34078f.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_08_672d34078f.png',
  },
  {
    id: '09',
    label: 'Sample 9',
    thumbUrl:
      'https://plugins-media.makeupar.com/strapi/assets/small_skin_analysis_09_a0efc29e3e.png',
    fullUrl:
      'https://plugins-media.makeupar.com/strapi/assets/skin_analysis_09_a0efc29e3e.png',
  },
]

export const EXAMPLE_IMAGE_URL = SAMPLE_PORTRAITS[0].fullUrl

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

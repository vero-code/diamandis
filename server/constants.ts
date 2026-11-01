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
export type Page = 'home' | 'privacy' | 'terms'

export type LocalFilePayload = {
  fileName: string
  contentType: string
  dataUrl: string
}

export type Metric = {
  type: string
  ui_score?: number
  raw_score?: number
  score?: number
  skin_type?: string
  region?: string
  mask_url?: string
}

export type FragranceRecommendation = {
  name: string
  concentration: string
  notes: string
  reason: string
}

export type SkinPrepRecommendation = {
  name: string
  focus: string
  reason: string
}

export type CurationResult = {
  retentionProfile: string
  skinPrep: SkinPrepRecommendation
  recommendations: FragranceRecommendation[]
}

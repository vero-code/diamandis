import type { CurationResult, Metric, Page } from '../types'

export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null
}

export function getMetrics(value: unknown): Metric[] {
  const results = asRecord(value)?.results
  const output = asRecord(results)?.output
  if (!Array.isArray(output)) return []

  return output.flatMap((item): Metric[] => {
    const row = asRecord(item)
    if (!row || typeof row.type !== 'string') return []

    const maskUrls = Array.isArray(row.mask_urls) ? row.mask_urls : []
    const firstMask =
      typeof maskUrls[0] === 'string' ? maskUrls[0] : undefined

    return [{
      type: row.type,
      ...(typeof row.ui_score === 'number' ? { ui_score: row.ui_score } : {}),
      ...(typeof row.raw_score === 'number' ? { raw_score: row.raw_score } : {}),
      ...(typeof row.score === 'number' ? { score: row.score } : {}),
      ...(typeof row.skin_type === 'string' ? { skin_type: row.skin_type } : {}),
      ...(typeof row.region === 'string' ? { region: row.region } : {}),
      ...(firstMask ? { mask_url: firstMask } : {}),
    }]
  })
}

export function getCuration(value: unknown): CurationResult {
  const root = asRecord(value)
  const retentionProfile = root?.retentionProfile
  const skinPrep = asRecord(root?.skinPrep)
  const rows = root?.recommendations

  if (
    typeof retentionProfile !== 'string' ||
    !skinPrep ||
    typeof skinPrep.name !== 'string' ||
    typeof skinPrep.focus !== 'string' ||
    typeof skinPrep.reason !== 'string' ||
    !Array.isArray(rows)
  ) {
    throw new Error('Gemini response did not include a valid curation.')
  }

  const recommendations = rows.map((row: unknown) => {
    const item = asRecord(row)
    if (
      !item ||
      typeof item.name !== 'string' ||
      typeof item.concentration !== 'string' ||
      typeof item.notes !== 'string' ||
      typeof item.reason !== 'string'
    ) {
      throw new Error('Gemini returned an invalid recommendation.')
    }

    return {
      name: item.name,
      concentration: item.concentration,
      notes: item.notes,
      reason: item.reason,
    }
  })

  return {
    retentionProfile,
    skinPrep: {
      name: skinPrep.name,
      focus: skinPrep.focus,
      reason: skinPrep.reason,
    },
    recommendations,
  }
}


export async function readJson(response: Response): Promise<unknown> {
  const data: unknown = await response.json()
  if (!response.ok) {
    const message = asRecord(data)?.error
    throw new Error(typeof message === 'string' ? message : 'Request failed')
  }
  return data
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getPage(): Page {
  if (window.location.hash === '#/privacy') return 'privacy'
  if (window.location.hash === '#/terms') return 'terms'
  return 'home'
}

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

export function formatYouCamError(errorField: unknown): string {
  const raw =
    typeof errorField === 'string'
      ? errorField
      : typeof asRecord(errorField)?.code === 'string'
        ? String(asRecord(errorField)?.code)
        : typeof asRecord(errorField)?.message === 'string'
          ? String(asRecord(errorField)?.message)
          : ''
  const code = raw.toLowerCase()
  if (code.includes('error_no_face') || code.includes('no_face')) {
    return 'No face was detected in the photo (error_no_face). Please upload a clear, front-facing portrait.'
  }
  if (code.includes('error_multiple_people')) {
    return 'Multiple faces were detected (error_multiple_people). Please use a solo portrait.'
  }
  if (code.includes('error_large_face_angle') || code.includes('error_pose')) {
    return 'Face angle is too steep (error_large_face_angle). Please look directly at the camera.'
  }
  if (code.includes('exceed_max_filesize')) {
    return 'Image file size exceeds the YouCam limit. Please use a file under 10 MB.'
  }
  return raw
    ? `YouCam could not process this image (${raw}). Please try a clear front-facing portrait.`
    : 'YouCam could not detect a valid face in this image. Please try another portrait.'
}

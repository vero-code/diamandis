import { config } from 'dotenv'
import express from 'express'
import {
  allowedMetricTypes,
  baseUrl,
  dstActions,
  fileApiUrl,
  fragranceCatalog,
  skinPrepCatalog,
} from './constants.ts'

config({ path: 'server/.env' })

function getApiKey(): string {
  const key = process.env.PERFECTCORP_API_KEY?.trim()
  if (!key) throw new Error('PERFECTCORP_API_KEY is missing from server/.env')
  return key.startsWith('Bearer ') ? key : `Bearer ${key}`
}

const app = express()
app.use(express.json({ limit: '15mb' }))

const port = Number(process.env.PORT ?? 3001)

async function callYouCam(url: string, method: 'GET' | 'POST', body?: unknown) {
  const headers = new Headers({ Authorization: getApiKey() })
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  
  const response = await fetch(url, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(30_000),
  })

  const text = await response.text()
  let payload: unknown

  try {
    payload = JSON.parse(text)
  } catch {
    throw new Error(`YouCam returned a non-JSON response (HTTP ${response.status})`)
  }

  if (!response.ok) {
    throw new Error(`YouCam request failed (HTTP ${response.status}): ${text.slice(0, 500)}`)
  }

  return payload
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

app.post('/api/fragrance-recommendations', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: 'Gemini API key is not configured.' })
    return
  }

  if (!Array.isArray(req.body?.metrics) || req.body.metrics.length > 40) {
    res.status(400).json({ error: 'Provide a valid metrics array.' })
    return
  }

  const metrics = req.body.metrics.flatMap((item: unknown) => {
    if (!isRecord(item) || typeof item.type !== 'string') return []
    if (!allowedMetricTypes.has(item.type)) return []

    return [{
      type: item.type,
      ...(typeof item.ui_score === 'number' &&
      Number.isFinite(item.ui_score) &&
      item.ui_score >= 0 &&
      item.ui_score <= 100
        ? { ui_score: item.ui_score }
        : {}),
      ...(typeof item.skin_type === 'string'
        ? { skin_type: item.skin_type.slice(0, 40) }
        : {}),
      ...(typeof item.region === 'string'
        ? { region: item.region.slice(0, 20) }
        : {}),
    }]
  })

  if (metrics.length === 0) {
    res.status(400).json({ error: 'No supported skin metrics were provided.' })
    return
  }

  const preference =
    typeof req.body?.preference === 'string'
      ? req.body.preference.trim().slice(0, 120)
      : ''

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: [
                'You are a perfumery and skincare formulation advisor for Diamandis.',
                'Important: In YouCam API, ui_score is a 0-100 skin health score where 100 is optimal/calm and lower scores indicate a stronger concern (e.g., redness 97 means very calm skin with no redness, while oiliness 65 and moisture 65 are moderate concerns).',
                '- Oily / higher sebum skin naturally retains lipophilic fragrance molecules longer and amplifies heavy base notes (amber, resins, musk), so lighter EDT/EDP concentrations and crisp wood/mineral/tea/fig profiles bloom cleanly without becoming cloying, while pure citrus benefits from an oil-balancing primer.',
                '- Dry / lower moisture or low-oiliness skin lets volatile top notes evaporate rapidly, so higher concentrations (EDP/Extrait) with fixative base notes (amber, sandalwood, resins, musk) and a lipid-replenishing skin-prep balm help anchor the scent.',
                '- Texture, pore, and redness scores guide whether a smoothing or soothing barrier primer is needed before applying alcohol-based perfume.',
                'Tasks:',
                '1. Write a concise retentionProfile (2 sentences max) explaining how this specific skin profile (citing the actual scores and skin_type) interacts with top/base notes and which perfume concentrations work best on it.',
                '2. Pick the single best skinPrep from the SkinPrepCatalog based strictly on the skin metrics (NOT the scent preference) and explain why in prepReason.',
                '3. Recommend 3 fragrances from the FragranceCatalog that best bridge the user scent preference AND this skin retention profile, explaining both how the notes unfold (bloom) AND how long the base notes will last (longevity) on this specific skin.',
                'Do not make clinical or medical disease claims.',
                `User scent preference: ${preference || 'No specific preference'}`,
                `Skin metrics: ${JSON.stringify(metrics)}`,
                `SkinPrepCatalog: ${JSON.stringify(skinPrepCatalog)}`,
                `FragranceCatalog: ${JSON.stringify(fragranceCatalog)}`,
              ].join('\n'),
            }],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                retentionProfile: { type: 'STRING' },
                skinPrepName: { type: 'STRING' },
                prepReason: { type: 'STRING' },
                recommendations: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      name: { type: 'STRING' },
                      reason: { type: 'STRING' },
                    },
                    required: ['name', 'reason'],
                  },
                },
              },
              required: [
                'retentionProfile',
                'skinPrepName',
                'prepReason',
                'recommendations',
              ],
            },
          },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini request failed with HTTP ${response.status}`)
    }

    const payload: unknown = await response.json()
    const candidates =
      isRecord(payload) && Array.isArray(payload.candidates)
        ? payload.candidates
        : []
    const candidate = isRecord(candidates[0]) ? candidates[0] : null
    const content = candidate && isRecord(candidate.content)
      ? candidate.content
      : null
    const parts = content && Array.isArray(content.parts)
      ? content.parts
      : []
    const textPart = parts.find(
      (part) => isRecord(part) && typeof part.text === 'string',
    )
    const generatedText = isRecord(textPart) ? textPart.text : null

    if (typeof generatedText !== 'string') {
      throw new Error('Gemini response did not contain generated JSON.')
    }

    const generated: unknown = JSON.parse(generatedText)
    if (!isRecord(generated)) {
      throw new Error('Gemini returned a non-object JSON payload.')
    }

    const retentionProfile =
      typeof generated.retentionProfile === 'string'
        ? generated.retentionProfile.trim().slice(0, 450)
        : ''
    const skinPrepName =
      typeof generated.skinPrepName === 'string'
        ? generated.skinPrepName.trim()
        : ''
    const prepReason =
      typeof generated.prepReason === 'string'
        ? generated.prepReason.trim().slice(0, 350)
        : ''

    const matchedPrep =
      skinPrepCatalog.find((item) => item.name === skinPrepName) ??
      skinPrepCatalog[0]

    const generatedRows = generated.recommendations

    if (
      !retentionProfile ||
      !prepReason ||
      !Array.isArray(generatedRows) ||
      generatedRows.length === 0 ||
      generatedRows.length > 3
    ) {
      throw new Error('Gemini returned an incomplete curation response.')
    }

    const validated = generatedRows.map((row: unknown) => {
      if (
        !isRecord(row) ||
        typeof row.name !== 'string' ||
        typeof row.reason !== 'string' ||
        row.reason.trim().length === 0 ||
        row.reason.length > 350
      ) {
        throw new Error('Gemini returned an invalid recommendation.')
      }

      const fragrance = fragranceCatalog.find(
        (item) => item.name === row.name,
      )
      if (!fragrance) {
        throw new Error('Gemini returned an unknown fragrance.')
      }

      return {
        name: fragrance.name,
        concentration: fragrance.concentration,
        notes: fragrance.notes,
        reason: row.reason.trim(),
      }
    })

    if (new Set(validated.map((item) => item.name)).size !== validated.length) {
      throw new Error('Gemini returned duplicate recommendations.')
    }

    res.json({
      retentionProfile,
      skinPrep: {
        name: matchedPrep.name,
        focus: matchedPrep.focus,
        reason: prepReason,
      },
      recommendations: validated,
    })
  } catch (error) {
    console.error('Could not generate fragrance recommendations:', error)
    res.status(502).json({
      error: 'Could not generate fragrance recommendations.',
    })
  }
})

async function uploadToYouCam(
  fileName: string,
  contentType: string,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const payload = await callYouCam(fileApiUrl, 'POST', {
    files: [
      {
        file_name: fileName,
        file_size: bytes.byteLength,
        content_type: contentType,
      },
    ],
  })

  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null
  const files = Array.isArray(data?.files) ? data.files : []
  const fileEntry = isRecord(files[0]) ? files[0] : null
  const fileId = fileEntry?.file_id

  const rawReq = Array.isArray(fileEntry?.requests)
    ? fileEntry.requests[0]
    : fileEntry?.requests
  const uploadReq = isRecord(rawReq) ? rawReq : null
  const uploadUrl = uploadReq?.url

  if (typeof fileId !== 'string' || typeof uploadUrl !== 'string') {
    throw new Error('YouCam File API did not return file_id and upload url')
  }

  const putHeaders: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Length': String(bytes.byteLength),
  }

  if (isRecord(uploadReq?.headers)) {
    for (const [k, v] of Object.entries(uploadReq.headers)) {
      if (typeof v === 'string' || typeof v === 'number') {
        putHeaders[k] = String(v)
      }
    }
  }

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: putHeaders,
    body: bytes,
    signal: AbortSignal.timeout(30_000),
  })

  if (!putRes.ok) {
    throw new Error(`YouCam S3 upload failed (HTTP ${putRes.status})`)
  }

  return fileId
}

app.post('/api/skin-analysis', async (req, res) => {
  const imageUrl = req.body?.src_file_url
  const fileData = req.body?.file_data
  const fileName = req.body?.file_name
  const contentType = req.body?.content_type

  try {
    let sourceField: { src_file_id: string } | { src_file_url: string }

    if (typeof fileData === 'string' && fileData.length > 0) {
      const normalizedType =
        contentType === 'image/png' ? 'image/png' : 'image/jpeg'
      const safeName =
        typeof fileName === 'string' && fileName.trim().length > 0
          ? fileName.trim().slice(0, 80)
          : normalizedType === 'image/png'
            ? 'upload.png'
            : 'upload.jpg'

      const base64Clean = fileData.includes(',')
        ? fileData.split(',')[1]
        : fileData
      const bytes = new Uint8Array(Buffer.from(base64Clean, 'base64'))

      if (bytes.byteLength === 0 || bytes.byteLength > 10 * 1024 * 1024) {
        res.status(400).json({ error: 'File size must be under 10 MB.' })
        return
      }

      const fileId = await uploadToYouCam(safeName, normalizedType, bytes)
      sourceField = { src_file_id: fileId }
    } else if (typeof imageUrl === 'string' && imageUrl.startsWith('https://')) {
      sourceField = { src_file_url: imageUrl }
    } else {
      res.status(400).json({
        error: 'Provide an uploaded image or an HTTPS image URL.',
      })
      return
    }

    const payload = await callYouCam(baseUrl, 'POST', {
      dst_actions: dstActions,
      miniserver_args: { enable_mask_overlay: false },
      format: 'json',
      pf_camera_kit: false,
      ...sourceField,
    })

    const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null
    const taskId = data?.task_id

    if (typeof taskId !== 'string') {
      throw new Error('YouCam response did not contain data.task_id')
    }

    res.json({ task_id: taskId })
  } catch (error) {
    console.error('Could not start Skin Analysis:', error)
    res.status(502).json({ error: 'Could not start Skin Analysis.' })
  }
})

app.get('/api/skin-analysis/:taskId', async (req, res) => {
  try {
    const payload = await callYouCam(
      `${baseUrl}/${encodeURIComponent(req.params.taskId)}`,
      'GET',
    )

    const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null

    if (typeof data?.task_status !== 'string') {
      throw new Error('YouCam response did not contain data.task_status')
    }

    res.json({
      task_status: data.task_status,
      ...(data.task_status === 'success' ? { results: data.results } : {}),
      ...(data.task_status === 'error' ? { error: data.error } : {}),
    })
  } catch (error) {
    console.error('Could not check Skin Analysis:', error)
    res.status(502).json({ error: 'Could not check Skin Analysis status.' })
  }
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
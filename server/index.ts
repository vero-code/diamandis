import { config } from 'dotenv'
import express from 'express'
import {
  allowedMetricTypes,
  baseUrl,
  buildGeminiPrompt,
  creditApiUrl,
  dstActions,
  fileApiUrl,
  fragranceCatalog,
  geminiApiUrl,
  geminiResponseSchema,
  skinPrepCatalog,
} from './constants.ts'

// Loads server/.env locally; on Vercel, environment variables are injected automatically
config({ path: 'server/.env' })

const NO_CREDITS_MESSAGE =
  'Demo YouCam API credits are exhausted. Please open "🏛 Boutique & Judge Studio" in the top menu and enter your own YouCam API key.'

function getApiKey(overrideKey?: string): string {
  const key = (overrideKey?.trim() || process.env.PERFECTCORP_API_KEY)?.trim()
  if (!key) {
    throw new Error(
      'YouCam API key is not configured. Please add your key in "🏛 Boutique & Judge Studio".',
    )
  }
  return key.startsWith('Bearer ') ? key : `Bearer ${key}`
}

const app = express()
app.use(express.json({ limit: '15mb' }))

const port = Number(process.env.PORT ?? 3001)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function callYouCam(
  url: string,
  method: 'GET' | 'POST',
  body?: unknown,
  overrideKey?: string,
) {
  const headers = new Headers({ Authorization: getApiKey(overrideKey) })
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
    const lower = text.toLowerCase()
    if (
      response.status === 402 ||
      lower.includes('credit') ||
      lower.includes('unit') ||
      lower.includes('insufficient') ||
      lower.includes('quota')
    ) {
      throw new Error(NO_CREDITS_MESSAGE)
    }
    throw new Error(
      `YouCam request failed (HTTP ${response.status}): ${text.slice(0, 500)}`,
    )
  }

  return payload
}

async function getRemainingUnits(overrideKey?: string): Promise<number | null> {
  const payload = await callYouCam(creditApiUrl, 'GET', undefined, overrideKey)
  const results =
    isRecord(payload) && Array.isArray(payload.results) ? payload.results : []
  const first = isRecord(results[0]) ? results[0] : null
  return typeof first?.amount === 'number' ? first.amount : null
}

async function uploadToYouCam(
  fileName: string,
  contentType: string,
  bytes: Uint8Array<ArrayBuffer>,
  overrideKey?: string,
): Promise<string> {
  const payload = await callYouCam(
    fileApiUrl,
    'POST',
    {
      files: [
        {
          file_name: fileName,
          file_size: bytes.byteLength,
          content_type: contentType,
        },
      ],
    },
    overrideKey,
  )

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

app.get('/api/youcam-credits', async (req, res) => {
  try {
    const overrideKey = req.get('x-youcam-key')
    const units = await getRemainingUnits(overrideKey)
    if (typeof units === 'number' && units <= 0) {
      res.status(402).json({ error: NO_CREDITS_MESSAGE, units: 0 })
      return
    }
    res.json({ ok: true, units })
  } catch (error) {
    console.error('Could not verify YouCam API key:', error)
    res.status(401).json({
      error:
        error instanceof Error
          ? error.message
          : 'Could not verify YouCam API key. Please check the token.',
    })
  }
})

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

    return [
      {
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
      },
    ]
  })

  if (metrics.length === 0) {
    res.status(400).json({ error: 'No supported skin metrics were provided.' })
    return
  }

  const preference =
    typeof req.body?.preference === 'string'
      ? req.body.preference.trim().slice(0, 120)
      : ''

  const customPerfume =
    typeof req.body?.customPerfume === 'string'
      ? req.body.customPerfume.trim().slice(0, 100)
      : ''

  const activeCatalog =
    Array.isArray(req.body?.catalog) && req.body.catalog.length >= 3
      ? req.body.catalog
          .flatMap((item: unknown) => {
            if (
              !isRecord(item) ||
              typeof item.name !== 'string' ||
              typeof item.concentration !== 'string' ||
              typeof item.notes !== 'string'
            ) {
              return []
            }
            return [
              {
                name: item.name.trim().slice(0, 60),
                concentration: item.concentration.trim().slice(0, 60),
                notes: item.notes.trim().slice(0, 160),
              },
            ]
          })
          .slice(0, 20)
      : fragranceCatalog

  try {
    const response = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildGeminiPrompt(
                  metrics,
                  preference,
                  customPerfume,
                  activeCatalog,
                ),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema,
        },
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!response.ok) {
      throw new Error(`Gemini request failed with HTTP ${response.status}`)
    }

    const payload: unknown = await response.json()
    const candidates =
      isRecord(payload) && Array.isArray(payload.candidates)
        ? payload.candidates
        : []
    const candidate = isRecord(candidates[0]) ? candidates[0] : null
    const content =
      candidate && isRecord(candidate.content) ? candidate.content : null
    const parts =
      content && Array.isArray(content.parts) ? content.parts : []
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
        row.reason.trim().length === 0
      ) {
        throw new Error('Gemini returned an invalid recommendation.')
      }

      const fragrance = activeCatalog.find((item) => item.name === row.name)
      if (!fragrance) {
        throw new Error('Gemini returned an unknown fragrance.')
      }

      return {
        name: fragrance.name,
        concentration: fragrance.concentration,
        notes: fragrance.notes,
        longevity:
          typeof row.longevity === 'string' && row.longevity.trim()
            ? row.longevity.trim().slice(0, 40)
            : '6–8 hours',
        reason: row.reason.trim().slice(0, 600),
      }
    })

    if (new Set(validated.map((item) => item.name)).size !== validated.length) {
      throw new Error('Gemini returned duplicate recommendations.')
    }

    const customRaw = isRecord(generated.customPerfumeAnalysis)
      ? generated.customPerfumeAnalysis
      : null
    const customPerfumeAnalysis =
      customPerfume &&
      customRaw &&
      typeof customRaw.verdict === 'string' &&
      customRaw.verdict.trim()
        ? {
            name: customPerfume,
            longevity:
              typeof customRaw.longevity === 'string' &&
              customRaw.longevity.trim()
                ? customRaw.longevity.trim().slice(0, 40)
                : '6–8 hours',
            verdict: customRaw.verdict.trim().slice(0, 600),
          }
        : undefined

    res.json({
      retentionProfile,
      skinPrep: {
        name: matchedPrep.name,
        focus: matchedPrep.focus,
        reason: prepReason,
      },
      ...(customPerfumeAnalysis ? { customPerfumeAnalysis } : {}),
      recommendations: validated,
    })
  } catch (error) {
    console.error('Could not generate fragrance recommendations:', error)
    res.status(502).json({
      error: 'Could not generate fragrance recommendations.',
    })
  }
})

app.post('/api/skin-analysis', async (req, res) => {
  const imageUrl = req.body?.src_file_url
  const fileData = req.body?.file_data
  const fileName = req.body?.file_name
  const contentType = req.body?.content_type
  const overrideKey = req.get('x-youcam-key')

  try {
    // Free preflight credit check (0 units) to warn if demo credits hit 0
    const remainingUnits = await getRemainingUnits(overrideKey)
    if (typeof remainingUnits === 'number' && remainingUnits <= 0) {
      res.status(402).json({ error: NO_CREDITS_MESSAGE })
      return
    }

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

      const fileId = await uploadToYouCam(
        safeName,
        normalizedType,
        bytes,
        overrideKey,
      )
      sourceField = { src_file_id: fileId }
    } else if (typeof imageUrl === 'string' && imageUrl.startsWith('https://')) {
      sourceField = { src_file_url: imageUrl }
    } else {
      res.status(400).json({
        error: 'Provide an uploaded image or an HTTPS image URL.',
      })
      return
    }

    const payload = await callYouCam(
      baseUrl,
      'POST',
      {
        dst_actions: dstActions,
        miniserver_args: { enable_mask_overlay: false },
        format: 'json',
        pf_camera_kit: false,
        ...sourceField,
      },
      overrideKey,
    )

    const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null
    const taskId = data?.task_id

    if (typeof taskId !== 'string') {
      throw new Error('YouCam response did not contain data.task_id')
    }

    res.json({ task_id: taskId })
  } catch (error) {
    console.error('Could not start Skin Analysis:', error)
    const msg =
      error instanceof Error &&
      (error.message.includes('exhausted') ||
        error.message.includes('Boutique & Judge Studio'))
        ? error.message
        : 'Could not start Skin Analysis.'
    res.status(502).json({ error: msg })
  }
})

app.get('/api/skin-analysis/:taskId', async (req, res) => {
  try {
    const overrideKey = req.get('x-youcam-key')
    const payload = await callYouCam(
      `${baseUrl}/${encodeURIComponent(req.params.taskId)}`,
      'GET',
      undefined,
      overrideKey,
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

export default app

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`)
  })
}
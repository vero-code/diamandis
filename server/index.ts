import { config } from 'dotenv'
import express from 'express'

config({ path: 'server/.env' })

function getApiKey(): string {
  const key = process.env.PERFECTCORP_API_KEY
  if (!key) throw new Error('PERFECTCORP_API_KEY is missing from server/.env')
  return key
}

const app = express()
app.use(express.json({ limit: '1mb' }))

const port = Number(process.env.PORT ?? 3001)
const baseUrl =
  'https://yce-api-01.makeupar.com/s2s/v2.1/task/skin-analysis'

const dstActions = [
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

app.post('/api/skin-analysis', async (req, res) => {
  const imageUrl = req.body?.src_file_url

  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('https://')) {
    res.status(400).json({ error: 'Provide an HTTPS image URL in src_file_url.' })
    return
  }

  try {
    const payload = await callYouCam(baseUrl, 'POST', {
      dst_actions: dstActions,
      miniserver_args: { enable_mask_overlay: false },
      format: 'json',
      pf_camera_kit: false,
      src_file_url: imageUrl,
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
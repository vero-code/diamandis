import { config } from 'dotenv'
import express from 'express'

config({ path: 'server/.env' })

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { rateLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import uploadRouter from './routes/upload.js'
import processRouter from './routes/process.js'
import humanizeRouter from './routes/humanize.js'
import exportRouter from './routes/export.js'
import { isUsingMockProvider } from './services/aiService.js'

const app = express()
const PORT = process.env.PORT || 8787

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use('/api', rateLimiter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', aiProvider: isUsingMockProvider() ? 'mock' : 'anthropic' })
})

app.use('/api/upload', uploadRouter)
app.use('/api/process-file', processRouter)
app.use('/api/humanize', humanizeRouter)
app.use('/api/export', exportRouter)

app.use('/api', notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`HumanizeAI API listening on http://localhost:${PORT}`)
  if (isUsingMockProvider()) {
    console.log('No ANTHROPIC_API_KEY set — using the mock humanization provider (prototype mode).')
  }
})

import { Router } from 'express'
import { generateOutput } from '../services/documentService.js'
import { apiError } from '../middleware/fileValidation.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { humanized, originalFileName, format } = req.body ?? {}
    if (!humanized || !humanized.trim()) {
      throw apiError('EMPTY_INPUT', 'Nothing to export', 'There is no humanized content to export yet.', false)
    }
    if (!format) {
      throw apiError('MISSING_FORMAT', 'Missing export format', 'Please choose an export format.', false)
    }

    const { buffer, contentType } = await generateOutput(format, humanized)
    const base = (originalFileName ?? 'result').replace(/\.[^.]+$/, '')

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${base}_humanized.${format}"`)
    res.send(buffer)
  } catch (err) {
    next(err)
  }
})

export default router

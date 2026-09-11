import { Router } from 'express'
import { looksLikeCode } from '../services/codeProcessor.js'
import { apiError } from '../middleware/fileValidation.js'

const router = Router()

/**
 * Content-type detection for pasted (non-file) input. File uploads are
 * already routed to the correct extractor in /api/upload; this endpoint
 * classifies raw pasted text before humanization.
 */
router.post('/', (req, res, next) => {
  try {
    const { content } = req.body ?? {}
    if (!content || !content.trim()) {
      throw apiError('EMPTY_INPUT', 'Empty input', 'Please provide content before processing.', false)
    }

    let contentType = 'text'
    if (looksLikeCode(content)) contentType = 'code'
    else if (/^#{1,6}\s|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)/m.test(content)) contentType = 'markdown'

    res.json({ contentType })
  } catch (err) {
    next(err)
  }
})

export default router

import { Router } from 'express'
import { humanizeText, isUsingMockProvider } from '../services/aiService.js'
import { validateOutput } from '../services/validationService.js'
import { looksLikeCode } from '../services/codeProcessor.js'
import { apiError } from '../middleware/fileValidation.js'

const router = Router()

const MAX_INPUT_LENGTH = 60_000

router.post('/', async (req, res, next) => {
  try {
    const { content, contentType = 'text', settings } = req.body ?? {}

    if (!content || !content.trim()) {
      throw apiError('EMPTY_INPUT', 'Empty input', 'Please provide content before processing.', false)
    }
    if (content.length > MAX_INPUT_LENGTH) {
      throw apiError(
        'INPUT_TOO_LARGE',
        'Content is too long',
        `This content exceeds the ${MAX_INPUT_LENGTH.toLocaleString()} character limit. Try splitting it into smaller pieces.`,
        false,
      )
    }

    const resolvedSettings = {
      level: 'natural',
      preserveFormatting: true,
      preserveFacts: true,
      protectCode: true,
      ...settings,
    }

    const effectiveType = contentType === 'text' && looksLikeCode(content) ? 'code' : contentType
    const humanized = await humanizeText({ content, contentType: effectiveType, settings: resolvedSettings })
    const warnings = validateOutput(content, humanized)

    if (isUsingMockProvider()) {
      warnings.push({
        message: 'Running in prototype mode (no AI provider key configured) — using a lightweight mock rewrite.',
      })
    }

    res.json({
      original: content,
      humanized,
      warnings,
      contentType: effectiveType,
      codeProtected: resolvedSettings.protectCode,
    })
  } catch (err) {
    next(err)
  }
})

export default router

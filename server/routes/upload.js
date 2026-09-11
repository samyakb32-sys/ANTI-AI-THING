import { Router } from 'express'
import crypto from 'node:crypto'
import { upload, classifyExtension, apiError } from '../middleware/fileValidation.js'
import * as textProcessor from '../processors/textProcessor.js'
import * as docxProcessor from '../processors/docxProcessor.js'
import * as pdfProcessor from '../processors/pdfProcessor.js'
import * as pptxProcessor from '../processors/pptxProcessor.js'
import * as codeProcessor from '../processors/codeProcessor.js'

const router = Router()

const PROCESSORS = {
  txt: textProcessor,
  markdown: textProcessor,
  code: codeProcessor,
  docx: docxProcessor,
  pdf: pdfProcessor,
  pptx: pptxProcessor,
}

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw apiError('EMPTY_INPUT', 'No file provided', 'Please choose a file before uploading.', false)
    }

    const classification = classifyExtension(req.file.originalname)
    const processor = PROCESSORS[classification.type]
    if (!processor) {
      throw apiError(
        'UNSUPPORTED_FILE_TYPE',
        'Unsupported file type',
        'HumanizeAI currently supports TXT, DOCX, PDF and PPTX files.',
        false,
      )
    }

    const { text } = await processor.process(req.file.buffer)

    res.json({
      meta: {
        id: crypto.randomUUID(),
        name: req.file.originalname,
        size: req.file.size,
        type: classification.type,
        mimeType: req.file.mimetype,
      },
      text,
    })
  } catch (err) {
    next(err)
  }
})

export default router

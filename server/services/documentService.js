import { generateDocx } from './docxService.js'
import { generatePdf } from './pdfService.js'
import { generatePptx } from './pptService.js'

const CONTENT_TYPES = {
  txt: 'text/plain; charset=utf-8',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

export async function generateOutput(format, text) {
  switch (format) {
    case 'txt':
      return { buffer: Buffer.from(text, 'utf-8'), contentType: CONTENT_TYPES.txt }
    case 'docx':
      return { buffer: await generateDocx(text), contentType: CONTENT_TYPES.docx }
    case 'pdf':
      return { buffer: await generatePdf(text), contentType: CONTENT_TYPES.pdf }
    case 'pptx':
      return { buffer: await generatePptx(text), contentType: CONTENT_TYPES.pptx }
    default: {
      const err = new Error('Unsupported export format')
      err.apiError = {
        code: 'UNSUPPORTED_EXPORT_FORMAT',
        title: 'Unsupported export format',
        message: `"${format}" is not a supported export format.`,
        retryable: false,
      }
      err.status = 400
      throw err
    }
  }
}

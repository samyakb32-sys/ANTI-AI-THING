// pdf-parse@1.x on purpose: it's a single plain CommonJS entry point with
// no conditional "exports" map, so a bundler can't resolve it to a
// browser build that drags in pdfjs-dist's canvas/DOMMatrix code and
// crashes at import time in a serverless Node runtime (v2 hit exactly
// that on Vercel). Loaded via createRequire rather than a plain ESM
// `import`: pdf-parse's index.js checks `!module.parent` to decide
// whether it's being run standalone, and Node's CJS-interop for ESM
// `import` leaves that unset, so a bare `import` makes it try to read
// its own test fixture off disk and crash. require() sets module.parent
// correctly and skips that branch entirely.
// pdfkit is loaded the same way, for the same reason: its exports map
// also splits "import"/"require" targets, and Vercel's Node function
// bundler has been observed resolving the "import" target for a package
// that then gets executed through a CJS require() call, crashing with
// "Cannot use import statement outside a module".
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
const PDFDocument = require('pdfkit')

export async function extractPdf(buffer) {
  let data
  try {
    data = await pdfParse(buffer)
  } catch {
    const err = new Error('PDF extraction failed')
    err.apiError = {
      code: 'EXTRACTION_FAILED',
      title: 'Could not read this file',
      message: 'The PDF could not be read. It may be corrupted.',
      retryable: false,
    }
    err.status = 422
    throw err
  }

  if (!data.text.trim()) {
    const err = new Error('Empty PDF')
    err.apiError = {
      code: 'EMPTY_INPUT',
      title: 'No readable text found',
      message:
        'This PDF has no extractable text — it may be a scanned image. Scanned PDFs require OCR, which is planned for a future release.',
      retryable: false,
    }
    err.status = 400
    throw err
  }
  return data.text
}

export function generatePdf(text) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 56 })
      const chunks = []
      doc.on('data', (c) => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      doc.font('Helvetica').fontSize(11)
      text.split(/\n{2,}/).forEach((block, i) => {
        if (i > 0) doc.moveDown(0.8)
        doc.text(block, { align: 'left' })
      })
      doc.end()
    } catch (e) {
      reject(e)
    }
  })
}

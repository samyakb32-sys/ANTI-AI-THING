import { PDFParse } from 'pdf-parse'
import PDFDocument from 'pdfkit'

export async function extractPdf(buffer) {
  let parser
  try {
    parser = new PDFParse({ data: buffer })
    const data = await parser.getText()
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
  } catch (e) {
    if (e.apiError) throw e
    const err = new Error('PDF extraction failed')
    err.apiError = {
      code: 'EXTRACTION_FAILED',
      title: 'Could not read this file',
      message: 'The PDF could not be read. It may be corrupted.',
      retryable: false,
    }
    err.status = 422
    throw err
  } finally {
    await parser?.destroy()
  }
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

import mammoth from 'mammoth'
// Loaded via createRequire, not a static import: docx's exports map
// splits "import"/"require" targets, and Vercel's Node function bundler
// has been observed resolving the "import" (ESM) target for a package
// that then gets executed through a CJS require() call at runtime,
// crashing with "Cannot use import statement outside a module" (seen for
// pptxgenjs and pdfkit, which share this same dual-export shape).
import { createRequire } from 'node:module'

const { Document, Packer, Paragraph, HeadingLevel } = createRequire(import.meta.url)('docx')

export async function extractDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer })
    if (!result.value.trim()) {
      const err = new Error('Empty document')
      err.apiError = {
        code: 'EMPTY_INPUT',
        title: 'Empty document',
        message: 'This document does not contain any readable text.',
        retryable: false,
      }
      err.status = 400
      throw err
    }
    return result.value
  } catch (e) {
    if (e.apiError) throw e
    const err = new Error('DOCX extraction failed')
    err.apiError = {
      code: 'EXTRACTION_FAILED',
      title: 'Could not read this file',
      message: 'The document could not be read. It may be corrupted or in an unsupported format.',
      retryable: false,
    }
    err.status = 422
    throw err
  }
}

export async function generateDocx(text) {
  const paragraphs = text.split(/\n{2,}/).map((block) => {
    const isHeading = /^#{1,3}\s/.test(block)
    return new Paragraph({
      text: block.replace(/^#{1,3}\s/, ''),
      heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
    })
  })
  const doc = new Document({ sections: [{ children: paragraphs }] })
  return Packer.toBuffer(doc)
}

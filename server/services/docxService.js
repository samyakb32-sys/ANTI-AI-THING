import mammoth from 'mammoth'
import { Document, Packer, Paragraph, HeadingLevel } from 'docx'

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

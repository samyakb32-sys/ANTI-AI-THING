import { extractPdf } from '../services/pdfService.js'

export async function process(buffer) {
  return { text: await extractPdf(buffer) }
}

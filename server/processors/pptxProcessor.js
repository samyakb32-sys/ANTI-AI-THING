import { extractPptx } from '../services/pptService.js'

export function process(buffer) {
  const { text } = extractPptx(buffer)
  return { text }
}

import { extractText } from '../services/textService.js'

export function process(buffer) {
  return { text: extractText(buffer) }
}

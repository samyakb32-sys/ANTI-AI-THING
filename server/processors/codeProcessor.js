import { extractText } from '../services/textService.js'

/** Code files are read as plain text; protection happens in aiService before humanization. */
export function process(buffer) {
  return { text: extractText(buffer) }
}

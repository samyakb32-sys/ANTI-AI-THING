import { extractDocx } from '../services/docxService.js'

export async function process(buffer) {
  return { text: await extractDocx(buffer) }
}

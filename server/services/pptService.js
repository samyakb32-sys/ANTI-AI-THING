import AdmZip from 'adm-zip'
import PptxGenJS from 'pptxgenjs'

function stripXmlTags(xml) {
  const matches = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
  return matches
    .map((m) =>
      m[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'"),
    )
    .filter((t) => t.trim().length > 0)
}

export function extractPptx(buffer) {
  try {
    const zip = new AdmZip(buffer)
    const slideEntries = zip
      .getEntries()
      .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
      .sort((a, b) => {
        const na = Number(a.entryName.match(/slide(\d+)\.xml/)[1])
        const nb = Number(b.entryName.match(/slide(\d+)\.xml/)[1])
        return na - nb
      })

    if (slideEntries.length === 0) {
      const err = new Error('No slides found')
      err.apiError = {
        code: 'EXTRACTION_FAILED',
        title: 'Could not read this file',
        message: 'No slides were found in this presentation.',
        retryable: false,
      }
      err.status = 422
      throw err
    }

    const slides = slideEntries.map((entry, i) => {
      const xml = entry.getData().toString('utf-8')
      const lines = stripXmlTags(xml)
      return { slideNumber: i + 1, lines }
    })

    const text = slides
      .map((s) => `# Slide ${s.slideNumber}\n${s.lines.join('\n')}`)
      .join('\n\n')

    if (!text.replace(/# Slide \d+/g, '').trim()) {
      const err = new Error('Empty presentation')
      err.apiError = {
        code: 'EMPTY_INPUT',
        title: 'No readable text found',
        message: 'This presentation has no extractable text on its slides.',
        retryable: false,
      }
      err.status = 400
      throw err
    }

    return { text, slides }
  } catch (e) {
    if (e.apiError) throw e
    const err = new Error('PPTX extraction failed')
    err.apiError = {
      code: 'EXTRACTION_FAILED',
      title: 'Could not read this file',
      message: 'The presentation could not be read. It may be corrupted.',
      retryable: false,
    }
    err.status = 422
    throw err
  }
}

/** Rebuilds a presentation from humanized text, preserving "# Slide N" grouping. */
export async function generatePptx(text) {
  const pptx = new PptxGenJS()
  const blocks = text.split(/(?=# Slide \d+)/g).filter((b) => b.trim())

  const slideBlocks = blocks.length > 0 ? blocks : [text]
  for (const block of slideBlocks) {
    const slide = pptx.addSlide()
    const lines = block.replace(/^# Slide \d+\n?/, '').split('\n').filter(Boolean)
    const title = lines.shift() ?? ''
    if (title) {
      slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 1, fontSize: 24, bold: true })
    }
    if (lines.length) {
      slide.addText(lines.map((l) => ({ text: l, options: { bullet: true, breakLine: true } })), {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 5,
        fontSize: 16,
      })
    }
  }

  return pptx.write({ outputType: 'nodebuffer' })
}

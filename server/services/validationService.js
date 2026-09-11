const URL_RE = /https?:\/\/[^\s)]+/g
const NUMBER_RE = /\b\d[\d,.]*\b/g
const HEADING_RE = /^#{1,3}\s.+$/gm

function toSet(re, text) {
  return new Set((text.match(re) ?? []).map((s) => s.trim()))
}

/** Compares original vs. humanized content for signs of accidental data loss. */
export function validateOutput(original, humanized) {
  const warnings = []

  if (!humanized.trim()) {
    warnings.push({ message: 'The output was empty. Please review before exporting.' })
    return warnings
  }

  const origUrls = toSet(URL_RE, original)
  const outUrls = toSet(URL_RE, humanized)
  const missingUrls = [...origUrls].filter((u) => !outUrls.has(u))
  if (missingUrls.length > 0) {
    warnings.push({ message: 'Some URLs may have changed. Please review before exporting.' })
  }

  const origNumbers = toSet(NUMBER_RE, original)
  const outNumbers = toSet(NUMBER_RE, humanized)
  const missingNumbers = [...origNumbers].filter((n) => !outNumbers.has(n))
  if (missingNumbers.length > origNumbers.size * 0.2 && origNumbers.size > 0) {
    warnings.push({ message: 'Some numbers may have changed. Please review before exporting.' })
  }

  const origHeadings = (original.match(HEADING_RE) ?? []).length
  const outHeadings = (humanized.match(HEADING_RE) ?? []).length
  if (origHeadings > 0 && outHeadings < origHeadings) {
    warnings.push({ message: 'Some headings may be missing. Please review before exporting.' })
  }

  if (humanized.length < original.length * 0.4) {
    warnings.push({ message: 'The output is notably shorter than the original. Please review before exporting.' })
  }

  return warnings
}

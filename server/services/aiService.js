import { protect, restore } from './codeProcessor.js'

const LEVEL_INSTRUCTIONS = {
  light: 'Make only minor wording and flow improvements; keep meaning and structure very close to the original.',
  natural: 'Rewrite for balanced, natural human readability.',
  casual: 'Rewrite in a more conversational, relaxed tone where appropriate.',
  student: 'Rewrite in clear, natural student-oriented language, without deliberately introducing mistakes.',
  professional: 'Rewrite as polished, natural business/professional communication.',
}

function buildPrompt({ content, contentType, settings }) {
  const rules = [
    `Content type: ${contentType}.`,
    LEVEL_INSTRUCTIONS[settings.level] ?? LEVEL_INSTRUCTIONS.natural,
    'Preserve meaning, key facts, names, numbers, dates, citations, technical terminology and document order.',
    'Do not add fabricated information.',
    settings.preserveFormatting ? 'Keep headings, bullet lists and paragraph boundaries intact.' : '',
    settings.protectCode
      ? 'Any text wrapped in a PROTECTED placeholder token must be left completely untouched and returned verbatim in the same position.'
      : '',
    'Return only the rewritten content, with no preamble or explanation.',
  ]
    .filter(Boolean)
    .join(' ')

  return `${rules}\n\n---\n${content}\n---`
}

/**
 * Calls Anthropic's Messages API directly from the server. The API key is
 * read from process.env only — it is never sent to, or reachable from, the
 * browser bundle.
 */
async function anthropicProvider({ content, contentType, settings }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt({ content, contentType, settings }) }],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Anthropic API error ${res.status}: ${detail}`)
  }

  const data = await res.json()
  const text = data.content?.map((b) => b.text ?? '').join('') ?? ''
  if (!text.trim()) throw new Error('Anthropic API returned an empty response')
  return text
}

/**
 * Calls OpenAI's Chat Completions API directly from the server. Same
 * server-only-key guarantee as the Anthropic provider.
 */
async function openaiProvider({ content, contentType, settings }) {
  const apiKey = process.env.OPENAI_API_KEY
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: buildPrompt({ content, contentType, settings }) }],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`OpenAI API error ${res.status}: ${detail}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content ?? ''
  if (!text.trim()) throw new Error('OpenAI API returned an empty response')
  return text
}

/**
 * PROTOTYPE FALLBACK — used only when no AI provider key is configured.
 * A conservative, rule-based smoothing pass (no external calls) so the
 * full app is exercisable end-to-end without credentials. This is clearly
 * a mock and must be swapped for a real provider before production use.
 */
function mockProvider({ content }) {
  const fillerSwaps = [
    [/\bIn conclusion,?\s*/gi, 'All in all, '],
    [/\bIt is important to note that\s*/gi, 'Worth noting: '],
    [/\butilize\b/gi, 'use'],
    [/\bfurthermore,?\s*/gi, 'also, '],
    [/\badditionally,?\s*/gi, 'on top of that, '],
    [/\bIn today's world,?\s*/gi, 'These days, '],
  ]
  let out = content
  for (const [pattern, replacement] of fillerSwaps) {
    out = out.replace(pattern, replacement)
  }
  return out
}

function resolveProvider() {
  if (process.env.ANTHROPIC_API_KEY) return anthropicProvider
  if (process.env.OPENAI_API_KEY) return openaiProvider
  return mockProvider
}

export async function humanizeText({ content, contentType, settings }) {
  const { protectedText, placeholders } = protect(content, settings)
  const provider = resolveProvider()

  let rewritten
  try {
    rewritten = await provider({ content: protectedText, contentType, settings })
  } catch (err) {
    const apiErr = new Error('AI processing failed')
    apiErr.apiError = {
      code: 'AI_FAILURE',
      title: 'Humanization failed',
      message: 'The AI service could not process this content. Please try again.',
      retryable: true,
    }
    apiErr.status = 502
    apiErr.cause = err
    throw apiErr
  }

  return restore(rewritten, placeholders)
}

export function isUsingMockProvider() {
  return !process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY
}

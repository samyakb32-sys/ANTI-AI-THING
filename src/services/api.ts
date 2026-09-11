import type { ApiError, ContentSourceType, HumanizeResult, HumanizeSettings, UploadedFileMeta } from '../utils/types'

/**
 * Real API service abstraction. Talks to the Express backend
 * (server/) over /api/*. No AI logic ever lives here or in
 * components — this module is a thin, swappable transport layer.
 */

const BASE = '/api'

async function asApiError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json()
    return {
      code: body.code ?? 'UNKNOWN',
      title: body.title ?? 'Something went wrong',
      message: body.message ?? res.statusText,
      retryable: body.retryable ?? res.status >= 500,
    }
  } catch {
    return {
      code: 'NETWORK',
      title: 'Network error',
      message: 'The server could not be reached.',
      retryable: true,
    }
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}

export async function uploadFile(file: File): Promise<{ meta: UploadedFileMeta; text: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form })
  if (!res.ok) throw await asApiError(res)
  return res.json()
}

export async function humanize(input: {
  content: string
  contentType: ContentSourceType
  settings: HumanizeSettings
}): Promise<HumanizeResult> {
  const res = await fetch(`${BASE}/humanize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw await asApiError(res)
  return res.json()
}

export async function exportContent(input: {
  humanized: string
  originalFileName?: string
  format: ContentSourceType | 'txt' | 'docx' | 'pdf' | 'pptx'
}): Promise<Blob> {
  const res = await fetch(`${BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw await asApiError(res)
  return res.blob()
}

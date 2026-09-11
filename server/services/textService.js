export function extractText(buffer) {
  const text = buffer.toString('utf-8')
  if (!text.trim()) {
    const err = new Error('Empty file')
    err.apiError = {
      code: 'EMPTY_INPUT',
      title: 'Empty file',
      message: 'This file appears to be empty. Please provide content before processing.',
      retryable: false,
    }
    err.status = 400
    throw err
  }
  return text
}

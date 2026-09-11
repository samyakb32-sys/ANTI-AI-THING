import multer from 'multer'

export function notFoundHandler(_req, res) {
  res.status(404).json({
    code: 'NOT_FOUND',
    title: 'Not found',
    message: 'The requested resource does not exist.',
    retryable: false,
  })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        code: 'FILE_TOO_LARGE',
        title: 'File too large',
        message: 'This file exceeds the size limit. Try a smaller file or split the content.',
        retryable: false,
      })
    }
  }

  if (err.apiError) {
    return res.status(err.status ?? 400).json(err.apiError)
  }

  console.error(err)
  res.status(500).json({
    code: 'SERVER_ERROR',
    title: 'Server error',
    message: 'Something went wrong while processing your request.',
    retryable: true,
  })
}

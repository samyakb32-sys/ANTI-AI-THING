const WINDOW_MS = 60_000
const MAX_REQUESTS = 30

const hits = new Map()

export function rateLimiter(req, res, next) {
  const key = req.ip ?? 'unknown'
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(key, { start: now, count: 1 })
    return next()
  }

  entry.count += 1
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      code: 'RATE_LIMITED',
      title: 'Too many requests',
      message: 'Please slow down and try again shortly.',
      retryable: true,
    })
  }

  next()
}

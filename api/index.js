import { app } from '../server/app.js'

// Vercel's Node.js runtime accepts an Express app directly as the
// serverless request handler — every /api/* request is routed here
// via the rewrite in vercel.json and dispatched through the same
// Express app used for local development (server/index.js).
export default app

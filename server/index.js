import 'dotenv/config'
import { app } from './app.js'
import { isUsingMockProvider } from './services/aiService.js'

const PORT = process.env.PORT || 8787

app.listen(PORT, () => {
  console.log(`HumanizeAI API listening on http://localhost:${PORT}`)
  if (isUsingMockProvider()) {
    console.log('No ANTHROPIC_API_KEY set — using the mock humanization provider (prototype mode).')
  }
})

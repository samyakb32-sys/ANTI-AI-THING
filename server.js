const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const anthropic = new Anthropic();

app.use(express.json({ limit: '2mb' }));
app.use(express.static('public'));

async function extractText(file) {
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.docx')) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return value;
  }
  if (name.endsWith('.pdf')) {
    const { text } = await pdfParse(file.buffer);
    return text;
  }
  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return file.buffer.toString('utf-8');
  }
  throw new Error('Unsupported file type. Use .txt, .md, .docx, or .pdf.');
}

const TONE_PROMPTS = {
  casual: 'a relaxed, conversational tone, like you are talking to a friend about the topic',
  formal: 'a clear, formal academic tone but with natural sentence rhythm and your own voice',
  simple: 'simple, plain language a student would actually write, short sentences, no jargon',
};

app.post('/api/rewrite', upload.single('file'), async (req, res) => {
  try {
    let text = req.body.text || '';
    if (req.file) {
      text = await extractText(req.file);
    }
    text = text.trim();
    if (!text) {
      return res.status(400).json({ error: 'No text provided.' });
    }
    if (text.length > 20000) {
      return res.status(400).json({ error: 'Text too long (max 20,000 characters).' });
    }

    const tone = TONE_PROMPTS[req.body.tone] || TONE_PROMPTS.casual;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system:
        'You help a student rewrite their own assignment draft so it reads naturally in their own voice. ' +
        'Keep every fact, argument, citation, and the overall structure intact — do not add or remove content or invent claims. ' +
        `Rewrite in ${tone}. Vary sentence length, avoid repetitive AI-sounding phrasing and filler transitions, and keep it honest and true to the original meaning. ` +
        'Return only the rewritten text, no preamble or notes.',
      messages: [{ role: 'user', content: text }],
    });

    const rewritten = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    res.json({ rewritten });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Assignment rewriter running on http://localhost:${PORT}`));

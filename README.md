# HumanizeAI

Transform AI-generated text, documents and presentations into natural,
human-sounding content while preserving meaning, facts and structure.

The landing page (`/`) is built on the real, registered `KageLandingPage`
component from `@designcodeio/threeui` — the exact immersive Three.js scene,
unmodified, retoned to HumanizeAI's `#e0231c` accent via the component's own
typography/color props.

## Stack

- **Frontend:** Vite + React + TypeScript, React Router, Tailwind CSS v4
- **Backend:** Express (`server/`), file extraction (mammoth, pdf-parse,
  zip/xml for pptx), file generation (docx, pdfkit, pptxgenjs)
- **AI:** provider abstraction in `server/services/aiService.js` — uses the
  Anthropic API when `ANTHROPIC_API_KEY` is set, otherwise falls back to a
  clearly-labeled mock rewrite so the app is fully exercisable without a key

## Getting started

```bash
npm install
cp .env.example .env   # optionally add ANTHROPIC_API_KEY

npm run dev:all        # Vite (5173) + Express API (8787) together
# or run them separately:
npm run dev             # frontend only
npm run server:watch    # backend only
```

## Scripts

- `npm run build` — typecheck + production frontend build
- `npm run preview` — preview the production build
- `npm run server` — run the API once (no watch)

## Structure

```
src/            frontend (components, pages, hooks, services, utils)
server/         Express API (routes, services, processors, middleware)
public/landing-pages/   Kage's byte-identical authored assets
```

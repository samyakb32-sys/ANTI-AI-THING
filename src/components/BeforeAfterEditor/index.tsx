import { useMemo, useState } from 'react'
import type { HumanizeResult } from '../../utils/types'

interface Props {
  result: HumanizeResult
  onChangeHumanized: (text: string) => void
  onHumanizeAgain: () => void
  onDownload: (format: 'txt' | 'docx' | 'pdf' | 'pptx') => void
  fileName?: string
}

function countWords(text: string) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export default function BeforeAfterEditor({
  result,
  onChangeHumanized,
  onHumanizeAgain,
  onDownload,
  fileName,
}: Props) {
  const [showChanges, setShowChanges] = useState(false)
  const [history, setHistory] = useState<string[]>([result.humanized])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [exportOpen, setExportOpen] = useState(false)

  const stats = useMemo(
    () => ({
      words: countWords(result.humanized),
      chars: result.humanized.length,
    }),
    [result.humanized],
  )

  function pushHistory(text: string) {
    const next = [...history.slice(0, historyIndex + 1), text]
    setHistory(next)
    setHistoryIndex(next.length - 1)
    onChangeHumanized(text)
  }

  function undo() {
    if (historyIndex === 0) return
    const i = historyIndex - 1
    setHistoryIndex(i)
    onChangeHumanized(history[i])
  }

  function redo() {
    if (historyIndex >= history.length - 1) return
    const i = historyIndex + 1
    setHistoryIndex(i)
    onChangeHumanized(history[i])
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text)
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button className="toolbar-btn" onClick={undo} disabled={historyIndex === 0}>
            Undo
          </button>
          <button className="toolbar-btn" onClick={redo} disabled={historyIndex >= history.length - 1}>
            Redo
          </button>
          <button className="toolbar-btn" onClick={() => setShowChanges((v) => !v)}>
            {showChanges ? 'Hide Changes' : 'Show Changes'}
          </button>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-xs outline-none focus:border-[var(--color-accent)]"
          />
          <span className="text-[var(--color-text-dim)]">
            {stats.words} words · {stats.chars} chars
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="toolbar-btn" onClick={onHumanizeAgain}>
            Humanize Again
          </button>
          <div className="relative">
            <button
              className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-xs font-medium text-white"
              onClick={() => setExportOpen((v) => !v)}
            >
              Download / Export
            </button>
            {exportOpen && (
              <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1 text-xs shadow-xl">
                {(['txt', 'docx', 'pdf', 'pptx'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      onDownload(f)
                      setExportOpen(false)
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left hover:bg-white/5"
                  >
                    {(fileName ?? 'result').replace(/\.[^.]+$/, '')}_humanized.{f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/10 px-5 py-2 text-xs text-[var(--color-accent)]">
          {result.warnings.map((w, i) => (
            <p key={i}>⚠ {w.message}</p>
          ))}
        </div>
      )}

      {result.codeProtected && (
        <div className="border-b border-[var(--color-border)] px-5 py-2 text-xs font-medium text-[var(--color-accent)]">
          🔒 Code Protected — executable logic was left unchanged
        </div>
      )}

      <div className="grid divide-y divide-[var(--color-border)] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <EditorPane
          title="Original"
          value={result.original}
          readOnly
          highlight={showChanges ? search : undefined}
          onCopy={() => copy(result.original)}
        />
        <EditorPane
          title="Humanized"
          value={result.humanized}
          onChange={pushHistory}
          highlight={showChanges ? search : undefined}
          onCopy={() => copy(result.humanized)}
        />
      </div>
    </div>
  )
}

function EditorPane({
  title,
  value,
  onChange,
  readOnly,
  onCopy,
}: {
  title: string
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  highlight?: string
  onCopy: () => void
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 py-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-dim)]">
        {title}
        <button onClick={onCopy} className="normal-case text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
          Copy
        </button>
      </div>
      <textarea
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-h-80 flex-1 resize-none bg-transparent px-5 pb-5 text-sm leading-relaxed outline-none"
      />
    </div>
  )
}

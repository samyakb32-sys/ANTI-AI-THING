import { useCallback, useRef, useState } from 'react'

const ACCEPT = '.txt,.docx,.pdf,.pptx,.md,text/plain'

interface Props {
  onFile: (file: File) => void
  onPasteText: (text: string) => void
}

export default function UploadZone({ onFile, onPasteText }: Props) {
  const [dragActive, setDragActive] = useState(false)
  const [mode, setMode] = useState<'upload' | 'paste'>('upload')
  const [pasteValue, setPasteValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (!file) return
      if (file.type.startsWith('video/')) {
        alert("Video files aren't supported yet.")
        return
      }
      onFile(file)
    },
    [onFile],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="mb-4 flex gap-2 rounded-full border border-[var(--color-border)] p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 rounded-full py-1.5 transition-colors ${
            mode === 'upload' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-dim)]'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={`flex-1 rounded-full py-1.5 transition-colors ${
            mode === 'paste' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-dim)]'
          }`}
        >
          Paste Text
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors ${
            dragActive
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
              : 'border-[var(--color-border)] hover:border-white/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p className="text-sm text-[var(--color-text)]">Drag &amp; drop a file here, or click to browse</p>
          <p className="mt-2 text-xs text-[var(--color-text-dim)]">
            Supports TXT, DOCX, PDF, PPTX, Markdown, code
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-dim)]/70">Video files aren't supported yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder="Paste your AI-generated text, markdown, or code here..."
            className="min-h-56 w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="button"
            disabled={!pasteValue.trim()}
            onClick={() => onPasteText(pasteValue)}
            className="self-end rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Use this text
          </button>
        </div>
      )}
    </div>
  )
}

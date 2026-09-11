import { useHumanizeWorkflow } from '../../hooks/useHumanizeWorkflow'
import UploadZone from '../../components/UploadZone'
import StyleSelector from '../../components/StyleSelector'
import ProcessingStatus from '../../components/ProcessingStatus'
import BeforeAfterEditor from '../../components/BeforeAfterEditor'
import Toast from '../../components/Toast'
import * as api from '../../services/api'

export default function Humanize() {
  const wf = useHumanizeWorkflow()

  async function handleDownload(format: 'txt' | 'docx' | 'pdf' | 'pptx') {
    if (!wf.result) return
    try {
      const blob = await api.exportContent({
        humanized: wf.result.humanized,
        originalFileName: wf.fileMeta?.name,
        format,
      })
      const base = (wf.fileMeta?.name ?? 'result').replace(/\.[^.]+$/, '')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${base}_humanized.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Export failure — keep the generated text available, no data lost.
    }
  }

  return (
    <div className="pt-2">
      <div className="mb-8">
        <h1 className="font-editorial text-2xl text-[var(--color-text)]">Humanize Workspace</h1>
        <p className="mt-1 text-sm text-[var(--color-text-dim)]">
          Paste text or upload a file, choose a style, and review before/after.
        </p>
      </div>

      {(wf.state === 'EMPTY' || wf.state === 'UPLOADING' || wf.state === 'EXTRACTING') && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UploadZone onFile={wf.uploadFile} onPasteText={wf.setPastedText} />
            {(wf.state === 'UPLOADING' || wf.state === 'EXTRACTING') && (
              <p className="mt-3 text-sm text-[var(--color-text-dim)]">
                {wf.state === 'UPLOADING' ? 'Uploading file…' : 'Extracting content…'}
              </p>
            )}
          </div>
          <StyleSelector settings={wf.settings} onChange={wf.setSettings} />
        </div>
      )}

      {wf.state === 'READY' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-dim)]">
                  {wf.fileMeta ? wf.fileMeta.name : 'Pasted text'}{' '}
                  {wf.fileMeta && <span className="text-xs">({Math.round(wf.fileMeta.size / 1024)} KB)</span>}
                </span>
                <button
                  onClick={wf.removeFile}
                  className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={wf.content}
                onChange={(e) => wf.setPastedText(e.target.value, wf.contentType)}
                className="min-h-64 w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <button
              onClick={wf.runHumanize}
              className="w-full rounded-full bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto sm:px-8"
            >
              Humanize
            </button>
          </div>
          <StyleSelector settings={wf.settings} onChange={wf.setSettings} />
        </div>
      )}

      {(wf.state === 'PROCESSING' || wf.state === 'VALIDATING') && (
        <ProcessingStatus stages={wf.stages} />
      )}

      {wf.state === 'COMPLETED' && wf.result && (
        <BeforeAfterEditor
          result={wf.result}
          onChangeHumanized={wf.updateHumanized}
          onHumanizeAgain={wf.runHumanize}
          onDownload={handleDownload}
          fileName={wf.fileMeta?.name}
        />
      )}

      {wf.state === 'ERROR' && wf.error && (
        <div className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-8 text-center">
          <h3 className="text-lg font-medium text-[var(--color-text)]">{wf.error.title}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-dim)]">{wf.error.message}</p>
          <div className="mt-6 flex justify-center gap-3">
            {wf.error.retryable && (
              <button
                onClick={wf.retry}
                className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white"
              >
                Retry
              </button>
            )}
            <button
              onClick={wf.reset}
              className="rounded-full border border-[var(--color-border)] px-5 py-2 text-sm text-[var(--color-text-dim)]"
            >
              Try another file
            </button>
          </div>
        </div>
      )}

      {wf.state === 'ERROR' && !wf.error && <Toast message="Something went wrong." tone="error" />}
    </div>
  )
}

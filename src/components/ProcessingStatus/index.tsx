import type { ProcessingStage } from '../../utils/types'

export default function ProcessingStatus({ stages }: { stages: ProcessingStage[] }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <h3 className="mb-6 text-sm font-medium text-[var(--color-text)]">Processing your content</h3>
      <ul className="space-y-4">
        {stages.map((s) => (
          <li key={s.key} className="flex items-center gap-3 text-sm">
            <span
              className={
                s.status === 'done'
                  ? 'text-[var(--color-accent)]'
                  : s.status === 'active'
                    ? 'animate-pulse text-white'
                    : 'text-[var(--color-text-dim)]'
              }
            >
              {s.status === 'done' ? '✓' : s.status === 'active' ? '●' : '○'}
            </span>
            <span
              className={
                s.status === 'pending' ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text)]'
              }
            >
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

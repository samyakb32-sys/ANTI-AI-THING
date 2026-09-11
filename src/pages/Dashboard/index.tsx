import { Link } from 'react-router-dom'

const stats = [
  { label: 'Documents humanized', value: '0' },
  { label: 'Words processed', value: '0' },
  { label: 'Code blocks protected', value: '0' },
]

export default function Dashboard() {
  return (
    <div className="pt-2">
      <h1 className="font-editorial text-2xl text-[var(--color-text)]">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-text-dim)]">
        An overview of your HumanizeAI activity.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <div className="font-editorial text-3xl text-[var(--color-text)]">{s.value}</div>
            <div className="mt-1 text-sm text-[var(--color-text-dim)]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center">
        <p className="text-sm text-[var(--color-text-dim)]">
          Nothing humanized yet. Start with your first piece of content.
        </p>
        <Link
          to="/humanize"
          className="mt-4 inline-block rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white"
        >
          Humanize Content
        </Link>
      </div>
    </div>
  )
}

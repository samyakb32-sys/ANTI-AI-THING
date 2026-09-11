import { Link } from 'react-router-dom'

export default function Projects() {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-editorial text-2xl text-[var(--color-text)]">Projects</h1>
          <p className="mt-1 text-sm text-[var(--color-text-dim)]">
            Saved projects and history — coming in a future release.
          </p>
        </div>
        <Link
          to="/humanize"
          className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white"
        >
          New
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center text-sm text-[var(--color-text-dim)]">
        No projects yet. HumanizeAI's MVP processes content on demand without
        permanent storage — saved projects arrive in a future release.
      </div>
    </div>
  )
}

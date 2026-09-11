import { NavLink } from 'react-router-dom'

const links = [
  { to: '/humanize', label: 'Humanize' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/settings', label: 'Settings' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 text-sm font-medium tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          HumanizeAI
        </NavLink>
        <nav className="hidden gap-6 text-sm text-[var(--color-text-dim)] sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `transition-colors hover:text-[var(--color-text)] ${isActive ? 'text-[var(--color-text)]' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/humanize"
          className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Humanize Content
        </NavLink>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-dim)] sm:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => (isActive ? 'text-[var(--color-text)]' : 'whitespace-nowrap')}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

import type { HumanizationLevel, HumanizeSettings } from '../../utils/types'

const LEVELS: { value: HumanizationLevel; label: string; hint: string }[] = [
  { value: 'light', label: 'Light', hint: 'Minor wording and flow improvements' },
  { value: 'natural', label: 'Natural', hint: 'Balanced, everyday readability' },
  { value: 'casual', label: 'Casual', hint: 'More conversational and relaxed' },
  { value: 'student', label: 'Student', hint: 'Clear, natural student-oriented tone' },
  { value: 'professional', label: 'Professional', hint: 'Polished business communication' },
]

interface Props {
  settings: HumanizeSettings
  onChange: (settings: HumanizeSettings) => void
}

export default function StyleSelector({ settings, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h3 className="mb-4 text-sm font-medium text-[var(--color-text)]">Humanization Level</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => onChange({ ...settings, level: l.value })}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              settings.level === l.value
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text)]'
                : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-white/30'
            }`}
          >
            <div className="font-medium">{l.label}</div>
            <div className="mt-0.5 text-xs text-[var(--color-text-dim)]">{l.hint}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-4">
        <Toggle
          label="Preserve Formatting"
          checked={settings.preserveFormatting}
          onChange={(v) => onChange({ ...settings, preserveFormatting: v })}
        />
        <Toggle
          label="Preserve Facts"
          checked={settings.preserveFacts}
          onChange={(v) => onChange({ ...settings, preserveFacts: v })}
        />
        <Toggle
          label="Protect Code"
          checked={settings.protectCode}
          onChange={(v) => onChange({ ...settings, protectCode: v })}
        />
        {settings.protectCode && (
          <div className="rounded-lg bg-[var(--color-accent)]/10 px-3 py-2 text-xs font-medium text-[var(--color-accent)]">
            🔒 Code Protected
          </div>
        )}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm">
      <span className="text-[var(--color-text-dim)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}

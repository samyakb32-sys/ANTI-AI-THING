import { useState } from 'react'
import StyleSelector from '../../components/StyleSelector'
import { DEFAULT_SETTINGS } from '../../hooks/useHumanizeWorkflow'
import type { HumanizeSettings } from '../../utils/types'

export default function Settings() {
  const [settings, setSettings] = useState<HumanizeSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  return (
    <div className="pt-2">
      <h1 className="font-editorial text-2xl text-[var(--color-text)]">Settings</h1>
      <p className="mt-1 text-sm text-[var(--color-text-dim)]">
        Default humanization preferences applied to new sessions.
      </p>

      <div className="mt-8 max-w-md">
        <StyleSelector settings={settings} onChange={setSettings} />
        <button
          onClick={() => {
            setSaved(true)
            window.setTimeout(() => setSaved(false), 1500)
          }}
          className="mt-4 w-full rounded-full bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white"
        >
          {saved ? 'Saved' : 'Save defaults'}
        </button>
      </div>
    </div>
  )
}

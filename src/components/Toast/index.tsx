interface Props {
  message: string
  tone?: 'error' | 'info'
  onDismiss?: () => void
}

export default function Toast({ message, tone = 'info', onDismiss }: Props) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm shadow-xl ${
        tone === 'error' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-raised)] text-white'
      }`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-3 opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  )
}

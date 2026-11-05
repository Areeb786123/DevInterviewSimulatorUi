import { useEffect, useState } from 'react'

export type NodeLabelDialogProps = {
  open: boolean
  title: string
  initial: string
  onCancel: () => void
  onSave: (label: string) => void
}

export function NodeLabelDialog({
  open,
  title,
  initial,
  onCancel,
  onSave,
}: NodeLabelDialogProps) {
  const [label, setLabel] = useState(initial)

  useEffect(() => {
    if (open) setLabel(initial)
  }, [open, initial])

  useEffect(() => {
    if (!open) return

    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', cancelOnEscape)
    return () => window.removeEventListener('keydown', cancelOnEscape)
  }, [open, onCancel])

  if (!open) return null

  const trimmedLabel = label.trim()

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close label dialog"
        onClick={onCancel}
      />
      <form
        className="relative z-10 w-full max-w-md overflow-hidden rounded-md"
        style={{
          background: 'rgba(10, 16, 26, 0.98)',
          border: '3px solid var(--color-gold)',
          boxShadow: '0 8px 0 #000, 0 0 28px rgba(232,184,74,0.25)',
        }}
        onSubmit={(event) => {
          event.preventDefault()
          if (trimmedLabel) onSave(trimmedLabel)
        }}
      >
        <div className="border-b border-white/15 px-4 py-3">
          <p className="font-fighter text-xs tracking-[0.16em] text-[var(--color-gold)]">
            {title}
          </p>
        </div>

        <div className="px-4 py-4">
          <input
            className="font-body w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[var(--color-gold)] focus:outline-none"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            aria-label="Node label"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-white/15 px-4 py-3">
          <button
            type="button"
            className="font-fighter rounded px-3 py-1.5 text-[10px] text-white"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
            onClick={onCancel}
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="font-fighter rounded px-4 py-1.5 text-[10px] font-bold text-[#1a1208] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
              boxShadow: '0 3px 0 #8a6010',
            }}
            disabled={!trimmedLabel}
          >
            SAVE
          </button>
        </div>
      </form>
    </div>
  )
}

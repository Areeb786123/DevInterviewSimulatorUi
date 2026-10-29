import { useEffect, useState } from 'react'
import { useSpeechToText } from '../../hooks/useSpeechToText'
import { MicButton } from './MicButton'

export type ExplanationDialogProps = {
  open: boolean
  initial: string
  onSave: (text: string) => void
  onCancel: () => void
}

const PROMPTS = [
  'How does a request travel? (client → … → storage)',
  'Why did you pick the main storage / cache / queue pieces?',
  'What trade-off did you accept? (cost, complexity, consistency)',
]

export function ExplanationDialog({
  open,
  initial,
  onSave,
  onCancel,
}: ExplanationDialogProps) {
  const [text, setText] = useState(initial)

  useEffect(() => {
    if (open) setText(initial)
  }, [open, initial])

  const speech = useSpeechToText({
    onAppend: (chunk) => {
      setText((prev) => {
        const base = prev.trim()
        return base ? `${base} ${chunk}` : chunk
      })
    },
  })

  useEffect(() => {
    if (!open) speech.stop()
  }, [open, speech.stop])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Explain your architecture"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close explanation dialog"
        onClick={() => {
          speech.stop()
          onCancel()
        }}
      />
      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-md"
        style={{
          background: 'rgba(10, 16, 26, 0.98)',
          border: '3px solid var(--color-gold)',
          boxShadow: '0 8px 0 #000, 0 0 28px rgba(232,184,74,0.25)',
        }}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/15 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-fighter text-xs tracking-[0.18em] text-[var(--color-gold)] sm:text-sm">
              EXPLAIN YOUR ARCHITECTURE
            </p>
            <p className="font-body mt-1.5 text-xs leading-snug text-white/80 sm:text-sm">
              Interviewers score your reasoning — not just the diagram. Tell the
              story of this design in plain words.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1">
            <MicButton
              listening={speech.listening}
              supported={speech.supported}
              onToggle={speech.toggle}
            />
            <span className="font-fighter text-[8px] tracking-wide text-white/55">
              DICTATE
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <p className="font-fighter text-[9px] tracking-[0.14em] text-[#7dcfb6]">
            COVER THESE
          </p>
          <ul className="mt-1.5 space-y-1">
            {PROMPTS.map((line) => (
              <li
                key={line}
                className="font-body text-xs leading-snug text-white/85 sm:text-sm"
              >
                • {line}
              </li>
            ))}
          </ul>

          <textarea
            className="font-body mt-3 h-[min(48vh,20rem)] w-full resize-y rounded border border-white/20 bg-black/40 px-3 py-3 text-sm leading-relaxed text-white placeholder:text-white/40 focus:border-[var(--color-gold)] focus:outline-none sm:text-base"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Example: The client hits the app server. Posts are saved in Postgres for consistency. Redis caches the hot feed so reads stay cheap…"
            aria-label="Architecture explanation text"
            autoFocus
          />
          {speech.listening ? (
            <p className="font-fighter mt-2 text-[10px] tracking-wide text-[#ff8a7a]">
              LISTENING… tap mic to stop
            </p>
          ) : null}
          {speech.error ? (
            <p className="font-body mt-2 text-xs text-[#ff8a7a]">{speech.error}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-white/15 px-4 py-3">
          <button
            type="button"
            className="font-fighter rounded px-3 py-1.5 text-[10px] text-white"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
            onClick={() => {
              speech.stop()
              onCancel()
            }}
          >
            CANCEL
          </button>
          <button
            type="button"
            className="font-fighter rounded px-4 py-1.5 text-[10px] font-bold text-[#1a1208]"
            style={{
              background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
              boxShadow: '0 3px 0 #8a6010',
            }}
            onClick={() => {
              speech.stop()
              onSave(text.trim())
            }}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}

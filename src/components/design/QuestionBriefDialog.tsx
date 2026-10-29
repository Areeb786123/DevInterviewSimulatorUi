import { MissAiHintPanel } from './MissAiHintPanel'
import { QuestionBody } from './questionBody'

export type QuestionBriefDialogProps = {
  open: boolean
  question: string
  hints?: string[]
  onHint?: () => void
  onClose: () => void
}

/** Full level brief — only shown when opened from VIEW QUESTION. */
export function QuestionBriefDialog({
  open,
  question,
  hints = [],
  onHint,
  onClose,
}: QuestionBriefDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Level question brief"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        aria-label="Close question brief"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(85vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-md"
        style={{
          background: 'rgba(8, 14, 24, 0.98)',
          border: '3px solid var(--color-gold)',
          boxShadow: '0 10px 0 #000, 0 0 28px rgba(232,184,74,0.28)',
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 px-4 py-3">
          <div>
            <p className="font-fighter text-[10px] tracking-[0.18em] text-[var(--color-gold)]">
              QUESTION
            </p>
            <p
              className="font-fighter mt-1 text-lg text-white"
              style={{ textShadow: '1px 1px 0 #000' }}
            >
              Level brief
            </p>
          </div>
          <button
            type="button"
            className="font-fighter rounded px-3 py-1.5 text-[10px] text-white"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <QuestionBody question={question} />
          <MissAiHintPanel hints={hints} onHint={onHint} />
        </div>
      </div>
    </div>
  )
}

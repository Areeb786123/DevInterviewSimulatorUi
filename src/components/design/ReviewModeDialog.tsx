export type ReviewMode = 'base' | 'ai' | 'ultra'

export type ReviewModeDialogProps = {
  open: boolean
  busy?: boolean
  architecturePreview: string
  onChoose: (mode: ReviewMode) => void
  onCancel: () => void
}

const OPTIONS: {
  mode: ReviewMode
  title: string
  blurb: string
  badge: string
}[] = [
  {
    mode: 'base',
    title: 'BASE RUN',
    badge: 'Local',
    blurb:
      'Hardcoded level checks only — required path, counts, budget. Same idea as ▶ PLAY. No AI call.',
  },
  {
    mode: 'ai',
    title: 'AI RUN',
    badge: 'Groq / mock',
    blurb:
      'Send your current board as a design path (e.g. client → app server → mongodb) to the interviewer for a score. No writing required.',
  },
  {
    mode: 'ultra',
    title: 'ULTRA AI RUN',
    badge: 'Deep',
    blurb:
      'Fuller AI interview: design path + any tech decisions you saved + follow-up questions until you reach 8+.',
  },
]

export function ReviewModeDialog({
  open,
  busy = false,
  architecturePreview,
  onChoose,
  onCancel,
}: ReviewModeDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Choose interview review mode"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        aria-label="Close review mode dialog"
        onClick={onCancel}
        disabled={busy}
      />
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-md"
        style={{
          background: 'rgba(8, 14, 24, 0.98)',
          border: '3px solid var(--color-gold)',
          boxShadow: '0 10px 0 #000, 0 0 28px rgba(232,184,74,0.28)',
        }}
      >
        <div className="border-b border-white/15 px-4 py-3">
          <p className="font-fighter text-[10px] tracking-[0.18em] text-[var(--color-gold)]">
            AI INTERVIEW
          </p>
          <p
            className="font-fighter mt-1 text-lg text-white"
            style={{ textShadow: '1px 1px 0 #000' }}
          >
            Pick how to review this design
          </p>
          <p className="font-body mt-2 rounded-md px-2.5 py-2 text-xs leading-snug text-white/85"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <span className="font-fighter text-[9px] text-[#7dcfb6]">
              YOUR ARCH ·{' '}
            </span>
            {architecturePreview}
          </p>
        </div>

        <div className="flex flex-col gap-2 px-4 py-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              disabled={busy}
              aria-label={`Choose ${opt.title}`}
              className="rounded-md px-3 py-3 text-left disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.18)',
                boxShadow: '0 3px 0 #000',
              }}
              onClick={() => onChoose(opt.mode)}
            >
              <span className="flex items-center gap-2">
                <span
                  className="font-fighter text-sm text-white"
                  style={{ textShadow: '1px 1px 0 #000' }}
                >
                  {opt.title}
                </span>
                <span
                  className="font-fighter rounded px-1.5 py-0.5 text-[8px] text-[#1a1208]"
                  style={{
                    background:
                      'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
                  }}
                >
                  {opt.badge}
                </span>
              </span>
              <span className="font-body mt-1.5 block text-xs leading-snug text-white/75">
                {opt.blurb}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-end border-t border-white/15 px-4 py-3">
          <button
            type="button"
            className="font-fighter rounded px-4 py-1.5 text-[10px] text-white"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
            disabled={busy}
            onClick={onCancel}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}

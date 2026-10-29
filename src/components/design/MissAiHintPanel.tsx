import { useEffect, useState } from 'react'
import { MISS_AI } from '../../constants/missAi'
import { MissAiAvatar } from './MissAiAvatar'

export type MissAiHintPanelProps = {
  hints: string[]
  onHint?: () => void
}

/** Miss AI hints for the question column. */
export function MissAiHintPanel({ hints, onHint }: MissAiHintPanelProps) {
  const [hintIndex, setHintIndex] = useState(-1)

  useEffect(() => {
    setHintIndex(-1)
  }, [hints])

  const activeHint =
    hintIndex >= 0 && hints.length > 0
      ? hints[Math.min(hintIndex, hints.length - 1)]
      : null

  function revealHint() {
    if (hints.length === 0) return
    setHintIndex((i) => Math.min(i + 1, hints.length - 1))
    onHint?.()
  }

  return (
    <div
      className="mt-2 shrink-0 rounded-md p-2"
      style={{
        background: 'rgba(10, 35, 50, 0.95)',
        border: '1px solid rgba(79,210,255,0.5)',
        boxShadow: '0 2px 0 #000',
      }}
      aria-label={MISS_AI.name}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        >
          <MissAiAvatar className="h-9 w-9" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="font-fighter text-[10px] tracking-wide text-[#9fe8ff]"
            style={{ textShadow: '0 1px 0 #000' }}
          >
            {MISS_AI.nameUpper}
          </p>
          <button
            type="button"
            className="font-fighter mt-1 rounded px-2.5 py-1 text-[9px] text-[#0b1a33] disabled:opacity-50"
            style={{
              background: 'linear-gradient(180deg,#9fe8ff,#4fd2ff)',
              boxShadow: '0 2px 0 #1a5080',
            }}
            onClick={revealHint}
            disabled={hints.length === 0}
          >
            {hintIndex < 0
              ? 'HINT'
              : hintIndex >= hints.length - 1
                ? 'HINT (MAX)'
                : `HINT ${hintIndex + 1}/${hints.length}`}
          </button>
        </div>
      </div>
      {activeHint ? (
        <p
          className="font-body mt-2 text-xs leading-snug text-white"
          role="status"
        >
          {activeHint}
        </p>
      ) : (
        <p className="font-body mt-2 text-xs text-white/65">{MISS_AI.idlePrompt}</p>
      )}
    </div>
  )
}

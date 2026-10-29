import { useEffect, useState } from 'react'
import { MISS_AI } from '../../constants/missAi'
import { MissAiAvatar } from './MissAiAvatar'

export type MissAiHintPanelProps = {
  hints: string[]
  onHint?: () => void
}

/** Compact Miss AI strip for the question column. */
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
      className="shrink-0 rounded px-2 py-1.5"
      style={{
        background: 'rgba(8, 28, 40, 0.92)',
        border: '1px solid rgba(79,210,255,0.4)',
      }}
      aria-label={MISS_AI.name}
    >
      <div className="flex items-center gap-2">
        <MissAiAvatar className="h-7 w-7 shrink-0" />
        <p className="min-w-0 flex-1 truncate font-fighter text-[9px] tracking-wide text-[#9fe8ff]">
          {MISS_AI.nameUpper}
        </p>
        <button
          type="button"
          className="font-fighter shrink-0 rounded px-2 py-1 text-[9px] text-[#0b1a33] disabled:opacity-50"
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
              ? 'MAX'
              : `${hintIndex + 1}/${hints.length}`}
        </button>
      </div>
      {activeHint ? (
        <p className="font-body mt-1.5 text-xs leading-snug text-white/90" role="status">
          {activeHint}
        </p>
      ) : null}
    </div>
  )
}

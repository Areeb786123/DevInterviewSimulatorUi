import { useEffect, useState } from 'react'
import { MISS_AI } from '../../constants/missAi'
import { MissAiAvatar } from './MissAiAvatar'

export type MissAiHintPanelProps = {
  hints: string[]
  onHint?: () => void
}

/** Constant Miss AI UI — reused on every level; only `hints` change. */
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
      className="mt-2 shrink-0 rounded-md p-2.5"
      style={{
        background: 'rgba(10, 35, 50, 0.98)',
        border: '2px solid #4fd2ff',
        boxShadow: '0 3px 0 #000, 0 0 12px rgba(79,210,255,0.25)',
      }}
      aria-label={MISS_AI.name}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '2px solid #9fe8ff',
          }}
        >
          <MissAiAvatar className="h-12 w-12" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="font-fighter text-sm tracking-wide text-[#9fe8ff] sm:text-base"
            style={{ textShadow: '0 0 8px rgba(79,210,255,0.6), 0 1px 0 #000' }}
          >
            {MISS_AI.nameUpper}
          </p>
          <p className="font-body text-xs text-white/80 sm:text-sm">
            {MISS_AI.tagline}
          </p>
          <button
            type="button"
            className="font-fighter mt-1.5 rounded px-3 py-1.5 text-[10px] text-[#0b1a33] sm:text-xs"
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
          className="font-body mt-2.5 text-sm leading-snug text-white sm:text-base"
          style={{ textShadow: '0 1px 2px #000' }}
          role="status"
        >
          {activeHint}
        </p>
      ) : (
        <p className="font-body mt-2.5 text-sm text-white/75">
          {MISS_AI.idlePrompt}
        </p>
      )}
    </div>
  )
}

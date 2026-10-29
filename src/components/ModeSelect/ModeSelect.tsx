import { useState } from 'react'
import { useAudio } from '../../audio/AudioProvider'

export type ModeSelectProps = {
  onSystemDesignEnter: () => void
  onDsaEnter: () => void
  onSystemDesignHoverChange?: (hovering: boolean) => void
}

type Mode = {
  id: string
  label: string
  locked: boolean
}

const MODES: Mode[] = [
  { id: 'system-design', label: 'System Design', locked: false },
  { id: 'dsa', label: 'DSA Prep', locked: false },
  { id: 'sql', label: 'SQL Prep', locked: true },
]

export function ModeSelect({
  onSystemDesignEnter,
  onDsaEnter,
  onSystemDesignHoverChange,
}: ModeSelectProps) {
  const { playSfx, unlockAudio } = useAudio()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div className="relative z-20 w-full max-w-md px-4">
      <div
        className="border-4 border-black px-3 py-4 sm:px-5 sm:py-5"
        style={{
          background: 'rgba(8, 16, 24, 0.88)',
          boxShadow: 'inset 0 0 0 2px var(--color-gold), var(--shadow-plate)',
        }}
      >
        <p className="font-display mb-4 text-center text-[8px] text-[var(--color-gold)] sm:text-[10px]">
          CHOOSE ARENA
        </p>

        <div className="flex flex-col gap-2">
          {MODES.map((mode, index) => {
            const unlocked = !mode.locked
            return (
              <button
                key={mode.id}
                type="button"
                aria-label={mode.label}
                className="motion-safe-tile font-display group flex items-center justify-between border-2 border-black px-3 py-3 text-left text-[9px] sm:text-[11px]"
                style={{
                  animationDelay: `${index * 60}ms`,
                  background: unlocked
                    ? 'linear-gradient(180deg, #2a5a9a 0%, #1a3a6a 100%)'
                    : 'linear-gradient(180deg, #333 0%, #1a1a1a 100%)',
                  color: unlocked ? 'var(--color-text)' : '#777',
                  boxShadow: unlocked
                    ? '0 0 0 1px var(--color-mint), 3px 3px 0 #000'
                    : '3px 3px 0 #000',
                }}
                onMouseEnter={() => {
                  if (mode.id === 'system-design' && unlocked) {
                    onSystemDesignHoverChange?.(true)
                  }
                }}
                onMouseLeave={() => {
                  if (mode.id === 'system-design') {
                    onSystemDesignHoverChange?.(false)
                  }
                }}
                onClick={() => {
                  void (async () => {
                    await unlockAudio()
                    if (mode.locked) {
                      playSfx('deny')
                      setMessage('Coming soon')
                      return
                    }
                    playSfx('enter')
                    setMessage(null)
                    if (mode.id === 'system-design') onSystemDesignEnter()
                    else if (mode.id === 'dsa') onDsaEnter()
                  })()
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={unlocked ? 'text-[var(--color-gold)]' : 'opacity-30'}
                    aria-hidden
                  >
                    {unlocked ? '>' : 'X'}
                  </span>
                  {mode.label}
                </span>
                <span
                  className="text-[8px]"
                  style={{
                    color: unlocked ? 'var(--color-mint)' : '#666',
                  }}
                >
                  {unlocked ? 'ENTER' : 'LOCKED'}
                </span>
              </button>
            )
          })}
        </div>

        {message ? (
          <p
            className="font-display mt-3 text-center text-[8px] text-[var(--color-arcade-red)]"
            role="status"
          >
            {message}
          </p>
        ) : (
          <p className="font-display mt-3 text-center text-[7px] text-[var(--color-text-dim)]">
            System Design or DSA Prep to enter
          </p>
        )}
      </div>
    </div>
  )
}

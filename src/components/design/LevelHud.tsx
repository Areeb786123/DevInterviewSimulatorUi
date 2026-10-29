export type LevelHudProps = {
  secondsLeft: number
  spent: number
  budget: number
}

function formatTime(sec: number) {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export function LevelHud({ secondsLeft, spent, budget }: LevelHudProps) {
  const urgent = secondsLeft <= 15
  const tight = spent > budget * 0.85
  const over = spent > budget

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="rounded px-3 py-1.5"
        style={{
          background: urgent ? 'rgba(180,40,30,0.9)' : 'rgba(0,0,0,0.65)',
          border: `2px solid ${urgent ? '#ff6b5a' : 'var(--color-gold)'}`,
          boxShadow: '0 3px 0 #000',
        }}
        aria-label="Time remaining"
      >
        <p className="font-fighter text-[8px] tracking-widest text-white/70">
          TIMER
        </p>
        <p
          className="font-fighter text-sm text-white sm:text-base"
          style={{ textShadow: '0 1px 0 #000' }}
        >
          {formatTime(secondsLeft)}
        </p>
      </div>
      <div
        className="rounded px-3 py-1.5"
        style={{
          background: over ? 'rgba(180,40,30,0.9)' : 'rgba(0,0,0,0.65)',
          border: `2px solid ${over ? '#ff6b5a' : tight ? '#e8b84a' : 'var(--color-mint)'}`,
          boxShadow: '0 3px 0 #000',
        }}
        aria-label="Budget"
      >
        <p className="font-fighter text-[8px] tracking-widest text-white/70">
          BUDGET
        </p>
        <p
          className="font-fighter text-sm text-white sm:text-base"
          style={{ textShadow: '0 1px 0 #000' }}
        >
          ${spent} / ${budget}
        </p>
      </div>
    </div>
  )
}

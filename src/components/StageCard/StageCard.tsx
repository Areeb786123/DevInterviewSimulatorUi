import type { Stage } from '../../stages/stages'

export type StageCardProps = {
  stage: Stage
  focused: boolean
  onFocus: () => void
  onConfirm: () => void
}

export function StageCard({ stage, focused, onFocus, onConfirm }: StageCardProps) {
  const unlocked = !stage.locked

  return (
    <button
      type="button"
      aria-label={stage.label}
      aria-pressed={focused}
      aria-disabled={!unlocked}
      className="relative shrink-0 overflow-hidden transition-[box-shadow,transform] duration-150 motion-reduce:transition-none"
      style={{
        width: 112,
        height: 64,
        border: focused ? '2px solid var(--color-neon)' : '1px solid rgba(180,190,200,0.55)',
        boxShadow: focused
          ? '0 0 0 2px rgba(79,210,255,0.95), 0 0 18px rgba(79,210,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.25)'
          : 'inset 0 0 0 1px rgba(0,0,0,0.45)',
        transform: focused ? 'translateY(-2px)' : 'none',
        filter: unlocked ? undefined : 'grayscale(0.9) brightness(0.55)',
      }}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onConfirm}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 35%),
            linear-gradient(145deg, ${stage.plateFrom} 0%, ${stage.plateTo} 70%, #050810 100%)
          `,
        }}
      />
      {/* miniature skyline / nodes */}
      <div className="pointer-events-none absolute inset-x-1 bottom-1 top-3 opacity-70">
        <div
          className="absolute bottom-0 left-[8%] h-[55%] w-[14%]"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        />
        <div
          className="absolute bottom-0 left-[28%] h-[75%] w-[18%]"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        />
        <div
          className="absolute bottom-0 left-[52%] h-[45%] w-[12%]"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        />
        <div
          className="absolute bottom-0 left-[70%] h-[65%] w-[16%]"
          style={{ background: 'rgba(0,0,0,0.38)' }}
        />
      </div>
      {!unlocked ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span
            className="font-fighter text-[11px] font-bold tracking-wide text-white/80"
            style={{ textShadow: '0 1px 2px #000' }}
          >
            LOCK
          </span>
        </div>
      ) : null}
    </button>
  )
}

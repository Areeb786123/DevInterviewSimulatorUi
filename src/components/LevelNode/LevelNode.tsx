export type LevelNodeProps = {
  label: string
  shortLabel: string
  caption?: string
  onEnter: () => void
  left: string
  top: string
}

export function LevelNode({
  label,
  shortLabel,
  caption = 'PLAY',
  onEnter,
  left,
  top,
}: LevelNodeProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      style={{ left, top }}
      onClick={onEnter}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="motion-safe-level-hover relative flex flex-col items-center">
        <span
          className="pointer-events-none absolute -bottom-1 left-1/2 h-3 w-14 -translate-x-1/2 rounded-full sm:w-16"
          style={{
            background:
              'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
          }}
        />
        <span
          className="motion-safe-level-pulse pointer-events-none absolute left-1/2 top-3 h-16 w-16 -translate-x-1/2 rounded-full sm:top-2 sm:h-[4.5rem] sm:w-[4.5rem]"
          style={{
            border: '3px solid #ff4d3a',
            boxShadow: '0 0 16px rgba(255,70,50,0.7)',
          }}
          aria-hidden
        />
        <span
          className="relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full sm:h-[4.75rem] sm:w-[4.75rem]"
          style={{
            background:
              'radial-gradient(circle at 40% 28%, #efe4c8 0%, #b8a078 45%, #5a4830 100%)',
            boxShadow:
              '0 6px 0 #2a1c10, 0 0 0 4px #fff, 0 0 0 7px #1a1a1a, 0 0 28px rgba(255,60,40,0.85)',
          }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14"
            style={{
              background:
                'radial-gradient(circle at 35% 28%, #ff7a55 0%, #e02010 55%, #8a0c08 100%)',
              boxShadow:
                'inset 0 0 0 3px rgba(255,255,255,0.45), 0 3px 0 #5a0800',
            }}
          >
            <span
              className="motion-safe-level-star font-fighter text-2xl text-white sm:text-3xl"
              style={{ textShadow: '0 2px 0 #5a0800, 0 0 8px #fff' }}
              aria-hidden
            >
              ★
            </span>
          </span>
        </span>
        <span
          className="mt-2 min-w-[4.5rem] rounded px-2.5 py-1 text-center"
          style={{
            background: 'rgba(8, 12, 20, 0.92)',
            border: '2px solid #fff',
            boxShadow: '0 3px 0 #000, 0 0 12px rgba(0,0,0,0.45)',
          }}
        >
          <span
            className="font-fighter block text-[12px] font-bold tracking-wide text-[#ffe566] sm:text-sm"
            style={{ textShadow: '0 1px 0 #000' }}
          >
            {shortLabel}
          </span>
          <span className="font-fighter block text-[8px] tracking-wide text-white/90 sm:text-[9px]">
            {caption}
          </span>
        </span>
      </span>
    </button>
  )
}

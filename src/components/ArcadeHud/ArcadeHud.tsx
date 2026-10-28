export function ArcadeHud() {
  return (
    <header className="relative z-30 w-full px-3 pt-3 sm:px-6">
      <div className="mb-1 flex justify-between font-display text-[8px] text-[var(--color-text)] sm:text-[10px]">
        <span>1P  00000</span>
        <span>2P  00000</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <div>
          <p className="font-display mb-1 text-[8px] text-[var(--color-arcade-blue)] sm:text-[10px]">
            CANDIDATE
          </p>
          <div
            className="h-3 w-full border-2 border-black sm:h-4"
            style={{ background: 'var(--color-hp-empty)' }}
          >
            <div
              className="h-full w-[92%]"
              style={{ background: 'var(--color-hp)' }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center px-1">
          <span className="font-display text-[8px] text-[var(--color-arcade-red)]">
            K.O.
          </span>
          <span className="font-display text-xl text-[var(--color-text)] sm:text-3xl">
            99
          </span>
        </div>

        <div>
          <p className="font-display mb-1 text-right text-[8px] text-[var(--color-arcade-red)] sm:text-[10px]">
            INTERVIEWER
          </p>
          <div
            className="h-3 w-full border-2 border-black sm:h-4"
            style={{ background: 'var(--color-hp-empty)' }}
          >
            <div
              className="ml-auto h-full w-[88%]"
              style={{ background: 'var(--color-hp)' }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

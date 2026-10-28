export function BrandTitle() {
  return (
    <div className="relative z-20 px-3 text-center">
      <p className="font-display motion-safe-blink mb-2 text-[8px] text-[var(--color-gold)] sm:text-[10px]">
        INSERT COIN
      </p>
      <h1
        className="font-display text-[12px] leading-relaxed text-[var(--color-text)] sm:text-xl md:text-2xl"
        style={{
          textShadow: '3px 3px 0 #000, -1px 0 #3a7bd5, 1px 0 #d4452f',
        }}
      >
        DevInterviewSimulator
      </h1>
      <p className="font-display mt-3 text-[8px] leading-relaxed text-[var(--color-mint)] sm:text-[10px]">
        Build systems. Survive load.
      </p>
    </div>
  )
}

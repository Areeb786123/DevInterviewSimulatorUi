import { AnimatedFighter } from '../AnimatedFighter/AnimatedFighter'

export type FightRingProps = {
  ready?: boolean
}

export function FightRing({ ready = false }: FightRingProps) {
  return (
    <section
      className="relative z-20 w-full max-w-3xl px-3"
      aria-label="Candidate versus Interviewer"
    >
      <div
        className="relative overflow-hidden px-3 pb-3 pt-4 sm:px-8 sm:pb-4 sm:pt-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(12,20,28,0.55) 0%, rgba(8,12,18,0.92) 55%, #0a1018 100%)',
          boxShadow: '0 16px 0 rgba(0,0,0,0.45), 0 0 40px rgba(0,0,0,0.35)',
        }}
      >
        <p
          className="font-display mb-2 text-center text-[8px] tracking-[0.2em] text-[var(--color-text)] sm:text-[10px]"
          style={{ textShadow: '2px 2px 0 #000' }}
        >
          FIGHTING ARENA
        </p>

        <div className="relative flex items-end justify-between gap-2 px-1 sm:px-4">
          <AnimatedFighter
            role="candidate"
            facing="right"
            ready={ready}
            label="CANDIDATE"
            labelColor="var(--color-arcade-blue)"
          />

          <div className="mb-16 flex flex-col items-center sm:mb-24">
            <span
              className="font-display text-2xl text-[var(--color-gold)] sm:text-4xl"
              style={{ textShadow: '3px 3px 0 #000' }}
            >
              VS
            </span>
            <span className="font-display mt-2 text-[7px] text-[var(--color-text)] sm:text-[9px]">
              ROUND 1
            </span>
            <span className="font-display motion-safe-blink mt-2 text-[7px] text-[var(--color-arcade-red)]">
              FIGHT!
            </span>
          </div>

          <AnimatedFighter
            role="interviewer"
            facing="left"
            ready={ready}
            label="INTERVIEWER"
            labelColor="var(--color-arcade-red)"
          />
        </div>

        {/* Arena floor */}
        <div
          className="relative mx-auto mt-1 h-8 max-w-xl sm:h-10"
          style={{
            background:
              'repeating-linear-gradient(90deg, #6a6a6a 0 14px, #4a4a4a 14px 28px)',
            boxShadow: '0 6px 0 #1a1a1a',
            borderRadius: '2px',
          }}
        >
          <div
            className="absolute inset-x-1/4 top-1/2 h-4 -translate-y-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(58,123,213,0.35), transparent 70%)',
            }}
          />
        </div>
      </div>
    </section>
  )
}

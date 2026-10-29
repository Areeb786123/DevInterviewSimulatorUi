import { Link } from 'react-router-dom'
import type { NextLevelResult } from '../../levels/nextLevel'

type Props = {
  next: NextLevelResult
  onNextClick?: () => void
}

const SPARKS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 7) * 0.18}s`,
  duration: `${1.4 + (i % 5) * 0.25}s`,
  size: 4 + (i % 4) * 2,
  hue: [45, 55, 200, 320, 15, 130][i % 6]!,
}))

const BURSTS = [
  { left: '18%', top: '22%', delay: '0s' },
  { left: '72%', top: '18%', delay: '0.45s' },
  { left: '48%', top: '38%', delay: '0.9s' },
  { left: '30%', top: '55%', delay: '1.3s' },
  { left: '65%', top: '50%', delay: '1.7s' },
]

/** Light glitter / fireworks over the board + floating next-level CTA. */
export function ClearCelebration({ next, onNextClick }: Props) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      data-testid="clear-celebration"
      aria-live="polite"
    >
      {SPARKS.map((s) => (
        <span
          key={s.id}
          className="clear-spark absolute rounded-full"
          style={{
            left: s.left,
            top: '-8%',
            width: s.size,
            height: s.size,
            background: `hsl(${s.hue} 95% 65%)`,
            boxShadow: `0 0 6px hsl(${s.hue} 95% 70%)`,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {BURSTS.map((b, i) => (
        <div
          key={i}
          className="clear-burst absolute"
          style={{
            left: b.left,
            top: b.top,
            animationDelay: b.delay,
          }}
        >
          {Array.from({ length: 10 }, (_, j) => (
            <span
              key={j}
              className="clear-burst-ray absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: `hsl(${40 + j * 28} 100% 65%)`,
                ['--ray-angle' as string]: `${j * 36}deg`,
              }}
            />
          ))}
        </div>
      ))}

      <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 -translate-x-1/2 sm:bottom-6">
        {next.kind === 'next' ? (
          <Link
            to={next.route}
            aria-label="Next Level"
            className="font-fighter inline-flex items-center rounded-md px-6 py-3 text-sm font-bold tracking-wide text-[#1a1208] sm:text-base"
            style={{
              background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
              boxShadow:
                '0 5px 0 #8a6010, 0 0 28px rgba(255, 214, 90, 0.55), inset 0 1px 0 #fff8',
            }}
            onClick={onNextClick}
          >
            NEXT LEVEL →
          </Link>
        ) : (
          <button
            type="button"
            disabled
            aria-label="Coming soon"
            className="font-fighter cursor-not-allowed rounded-md px-6 py-3 text-sm font-bold tracking-wide text-white/80 sm:text-base"
            style={{
              background: 'linear-gradient(180deg, #5a5a5a 0%, #3a3a3a 100%)',
              boxShadow: '0 4px 0 #1a1a1a',
              opacity: 0.85,
            }}
          >
            COMING SOON
          </button>
        )}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useAudio } from '../../audio/AudioProvider'

export function MapSelectPlaceholderPage() {
  const { playSfx } = useAudio()
  return (
    <main className="relative grid min-h-full place-items-center overflow-hidden px-4 text-center">
      <img
        src="/assets/bg/adventure-map.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'brightness(0.4) saturate(1.05)' }}
        draggable={false}
      />
      <div
        className="relative z-10 border-4 border-black px-6 py-8"
        style={{
          background: 'rgba(8,16,24,0.92)',
          boxShadow: 'inset 0 0 0 2px var(--color-gold), 4px 4px 0 #000',
        }}
      >
        <h1
          className="font-display text-sm text-[var(--color-text)] sm:text-lg"
          style={{ textShadow: '2px 2px 0 #000' }}
        >
          Photo Sharing
        </h1>
        <p className="font-display mt-4 text-[8px] leading-relaxed text-[var(--color-mint)] sm:text-[10px]">
          Map select and Level 1 land in the next phase.
        </p>
        <Link
          to="/"
          className="font-display mt-6 inline-block text-[8px] text-[var(--color-gold)] sm:text-[10px]"
          onClick={() => playSfx('click')}
        >
          {'<'} Back to lobby
        </Link>
      </div>
    </main>
  )
}

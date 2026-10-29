import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listDsaQuestions } from '../../api/dsa'
import { useAudio } from '../../audio/AudioProvider'
import { AudioDock } from '../../components/AudioDock/AudioDock'
import type { DsaQuestionCard } from '../../dsa/types'

export function DsaListPage() {
  const navigate = useNavigate()
  const { playSfx, armDefaultMusic } = useAudio()
  const [cards, setCards] = useState<DsaQuestionCard[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const list = await listDsaQuestions()
        if (!cancelled) setCards(list)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className="relative min-h-full overflow-hidden"
      onPointerDown={() => {
        void armDefaultMusic()
      }}
    >
      <img
        src="/assets/bg/adventure-map.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'brightness(0.55) saturate(0.9)' }}
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,12,20,0.7) 0%, rgba(8,12,20,0.35) 40%, rgba(8,12,20,0.85) 100%)',
        }}
      />
      <AudioDock />

      <div className="relative z-10 mx-auto flex min-h-full max-w-3xl flex-col px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="font-fighter inline-flex rounded px-3 py-1.5 text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(180deg, #8b5a2b 0%, #5c3a18 100%)',
              boxShadow: '0 3px 0 #2a1808',
            }}
            onClick={() => playSfx('click')}
          >
            ← Back
          </Link>
          <h1
            className="font-fighter text-lg font-bold italic text-white sm:text-2xl"
            style={{ textShadow: '2px 2px 0 #000' }}
          >
            DSA PREP
          </h1>
        </div>

        <p className="font-body mt-4 text-sm text-white/80">
          Pick a question. Next screen: full brief, code editor, tests, and a 5-ball
          simulator that shows how the algorithm moves.
        </p>

        {error ? (
          <p className="font-fighter mt-6 text-sm text-[var(--color-arcade-red)]">
            {error}
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {cards.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  aria-label={card.title}
                  className="w-full rounded-md border-2 border-black px-4 py-4 text-left"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(42,90,154,0.95) 0%, rgba(26,58,106,0.95) 100%)',
                    boxShadow: '0 0 0 1px var(--color-mint), 4px 4px 0 #000',
                  }}
                  onClick={() => {
                    playSfx('enter')
                    navigate(`/dsa/${card.id}`)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-fighter text-base font-bold text-white sm:text-lg">
                        {card.title}
                      </p>
                      <p className="font-body mt-1 text-sm text-white/75">
                        {card.blurb}
                      </p>
                    </div>
                    <span className="font-fighter shrink-0 rounded px-2 py-1 text-[10px] text-[#0b1220]"
                      style={{ background: 'var(--color-mint)' }}
                    >
                      {card.difficulty}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

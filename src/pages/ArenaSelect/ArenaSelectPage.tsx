import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAudio } from '../../audio/AudioProvider'
import { AudioDock } from '../../components/AudioDock/AudioDock'
import { StagePreview } from '../../components/StagePreview/StagePreview'
import { StageSchematic } from '../../components/StageSchematic/StageSchematic'
import { StageStrip } from '../../components/StageStrip/StageStrip'
import { FIRST_UNLOCKED_ID, STAGES, getStage } from '../../stages/stages'

const SHARDS = [
  { top: '12%', left: '8%', size: 10, delay: '0s' },
  { top: '22%', left: '78%', size: 14, delay: '1.2s' },
  { top: '40%', left: '18%', size: 8, delay: '2.1s' },
  { top: '55%', left: '88%', size: 12, delay: '0.6s' },
  { top: '70%', left: '12%', size: 9, delay: '3s' },
  { top: '18%', left: '52%', size: 7, delay: '1.8s' },
  { top: '62%', left: '62%', size: 11, delay: '2.6s' },
  { top: '35%', left: '92%', size: 6, delay: '0.3s' },
]

export function ArenaSelectPage() {
  const navigate = useNavigate()
  const { playSfx, armDefaultMusic } = useAudio()
  const [focusedId, setFocusedId] = useState(FIRST_UNLOCKED_ID)

  const focused = getStage(focusedId) ?? STAGES[0]!

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      playSfx('click')
      navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, playSfx])

  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ background: 'var(--color-stage-bg)' }}
      onPointerDown={() => {
        void armDefaultMusic()
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 55% 35%, #143056 0%, #070c16 55%, #03050a 100%)',
        }}
      />
      <img
        src="/assets/bg/adventure-map.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
        style={{ filter: 'brightness(0.45) saturate(0.7) hue-rotate(190deg)' }}
        draggable={false}
      />
      <div
        className="motion-safe-lens pointer-events-none absolute left-0 right-0 top-[38%] h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 5%, rgba(160,210,255,0.85) 45%, rgba(255,255,255,0.9) 50%, rgba(160,210,255,0.85) 55%, transparent 95%)',
          boxShadow: '0 0 24px 4px rgba(120,180,255,0.35)',
        }}
      />
      {SHARDS.map((s, i) => (
        <span
          key={i}
          className="motion-safe-shard pointer-events-none absolute"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size * 1.4,
            animationDelay: s.delay,
            background:
              'linear-gradient(135deg, rgba(180,220,255,0.75), rgba(79,210,255,0.15))',
            clipPath: 'polygon(50% 0%, 100% 40%, 70% 100%, 0% 60%)',
            filter: 'blur(0.2px)',
          }}
        />
      ))}

      <AudioDock />

      <div className="relative z-10 flex min-h-full flex-col px-3 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
        <div className="mb-2 flex items-center justify-between">
          <Link
            to="/"
            className="font-fighter text-xs font-semibold tracking-wide text-white/80 hover:text-[var(--color-neon)] sm:text-sm"
            onClick={() => playSfx('click')}
          >
            ← BACK
          </Link>
          <p className="font-fighter text-xs tracking-[0.2em] text-white/50 sm:text-sm">
            SELECT STAGE
          </p>
          <span className="w-14" aria-hidden />
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-1 items-stretch gap-3 sm:gap-4">
          <StageSchematic stage={focused} />
          <div className="relative min-w-0 flex-1 self-center">
            <StagePreview stage={focused} confirmed={false} />
          </div>
        </div>

        <div className="mx-auto mt-4 w-full max-w-5xl sm:mt-5">
          <StageStrip
            stages={STAGES}
            focusedId={focusedId}
            onFocusChange={setFocusedId}
            onConfirm={(id) => {
              if (id === 'social-media') {
                navigate('/system-design/social-media')
              }
            }}
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70">
            <span className="font-fighter text-[11px] tracking-wide sm:text-xs">
              <kbd className="mr-1 inline-block border border-white/30 px-1.5 py-0.5 text-[10px]">
                ←→
              </kbd>
              Select
            </span>
            <span className="font-fighter text-[11px] tracking-wide sm:text-xs">
              <kbd className="mr-1 inline-block border border-white/30 px-1.5 py-0.5 text-[10px]">
                Enter
              </kbd>
              Confirm
            </span>
            <span className="font-fighter text-[11px] tracking-wide sm:text-xs">
              <kbd className="mr-1 inline-block border border-white/30 px-1.5 py-0.5 text-[10px]">
                Esc
              </kbd>
              Back
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

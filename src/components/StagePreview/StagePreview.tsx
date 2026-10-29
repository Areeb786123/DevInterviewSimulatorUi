import type { Stage } from '../../stages/stages'

export type StagePreviewProps = {
  stage: Stage
  confirmed: boolean
}

export function StagePreview({ stage, confirmed }: StagePreviewProps) {
  return (
    <div
      className="relative w-full max-w-3xl overflow-hidden"
      style={{
        aspectRatio: '16 / 9',
        border: '3px solid #c5ccd4',
        boxShadow:
          '0 0 0 1px #6a737c, 0 12px 40px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.35)',
        background: '#0a1018',
      }}
    >
      {/* scenic stage art via layered gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 70% 20%, ${stage.accent}55 0%, transparent 55%),
            linear-gradient(180deg, ${stage.plateFrom} 0%, ${stage.plateTo} 45%, #071018 100%)
          `,
          filter: stage.locked ? 'grayscale(0.7) brightness(0.55)' : undefined,
        }}
      />
      {/* horizon city / landscape silhouettes */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%]">
        <svg
          className="h-full w-full"
          viewBox="0 0 800 240"
          preserveAspectRatio="none"
          aria-hidden
        >
          <polygon
            fill="rgba(0,0,0,0.45)"
            points="0,240 0,140 40,140 40,90 70,90 70,150 110,150 110,70 150,70 150,120 190,120 190,50 240,50 240,130 280,130 280,80 330,80 330,160 380,160 380,40 430,40 430,110 480,110 480,75 540,75 540,145 590,145 590,55 650,55 650,125 700,125 700,95 760,95 760,150 800,150 800,240"
          />
          <polygon
            fill="rgba(0,0,0,0.28)"
            points="0,240 60,180 140,200 220,160 320,190 420,150 520,185 620,155 720,190 800,170 800,240"
          />
        </svg>
      </div>
      {/* water / floor reflection band */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]"
        style={{
          background: `linear-gradient(180deg, transparent, ${stage.accent}22 40%, rgba(0,0,0,0.5))`,
        }}
      />

      {stage.locked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45">
          <p
            className="font-fighter text-3xl font-bold italic tracking-wider text-white/90 sm:text-5xl"
            style={{ textShadow: '0 0 12px #000, 3px 3px 0 #000' }}
          >
            COMING SOON
          </p>
        </div>
      ) : null}

      {/* stage title plate */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-4 pt-10 sm:pb-6">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.75) 70%)',
          }}
        />
        <h2
          className="font-fighter relative z-10 text-2xl font-bold italic uppercase tracking-[0.06em] text-white sm:text-4xl md:text-5xl"
          style={{
            textShadow:
              '0 0 2px #000, 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
          }}
        >
          {stage.label}
        </h2>
        <p className="font-fighter relative z-10 mt-1 text-xs tracking-widest text-white/75 sm:text-sm">
          {confirmed ? 'LEVEL 1 — COMING SOON' : stage.tagline}
        </p>
      </div>
    </div>
  )
}

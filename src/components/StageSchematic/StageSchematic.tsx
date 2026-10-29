import type { Stage } from '../../stages/stages'

export type StageSchematicProps = {
  stage: Stage
}

export function StageSchematic({ stage }: StageSchematicProps) {
  return (
    <aside className="flex w-[112px] shrink-0 flex-col gap-2 sm:w-[128px]">
      <div
        className="px-1.5 py-1 text-center"
        style={{
          background: 'linear-gradient(90deg, #f5c518, #c9a012)',
          boxShadow: '0 2px 0 #000',
        }}
      >
        <p className="font-fighter text-[10px] font-bold tracking-wide text-black sm:text-[11px]">
          {stage.badge}
        </p>
      </div>

      {[0, 1].map((layer) => (
        <div
          key={layer}
          className="relative aspect-square overflow-hidden"
          style={{
            border: '1px solid rgba(180,190,200,0.65)',
            background:
              'linear-gradient(160deg, #1a2433 0%, #0c121c 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
          }}
        >
          <svg className="h-full w-full p-2" viewBox="0 0 100 100" aria-hidden>
            <rect
              x="8"
              y="8"
              width="84"
              height="84"
              fill="none"
              stroke="rgba(160,180,200,0.35)"
              strokeWidth="1"
            />
            <line
              x1="8"
              y1="50"
              x2="92"
              y2="50"
              stroke="rgba(160,180,200,0.25)"
              strokeWidth="1"
            />
            <line
              x1="50"
              y1="8"
              x2="50"
              y2="92"
              stroke="rgba(160,180,200,0.25)"
              strokeWidth="1"
            />
            {/* graph-ish nodes */}
            <circle cx="28" cy={layer === 0 ? 32 : 62} r="3.5" fill="#fff" />
            <circle cx="72" cy={layer === 0 ? 68 : 30} r="3.5" fill={stage.accent} />
            <circle cx="50" cy="50" r="2.5" fill="rgba(255,255,255,0.7)" />
            <path
              d={
                layer === 0
                  ? 'M28 32 L50 50 L72 68'
                  : 'M28 62 L50 50 L72 30'
              }
              fill="none"
              stroke="rgba(200,220,240,0.45)"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      ))}

      <div className="flex flex-wrap gap-1">
        {stage.features.map((f, i) => (
          <div
            key={f}
            title={f}
            className="flex h-5 w-5 items-center justify-center sm:h-6 sm:w-6"
            style={{
              border: '1px solid rgba(0,0,0,0.6)',
              background:
                i % 3 === 0
                  ? '#c44536'
                  : i % 3 === 1
                    ? '#2f9e6b'
                    : '#d97706',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
            }}
          >
            <span className="font-fighter text-[6px] font-bold text-white sm:text-[7px]">
              {f.slice(0, 1)}
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}

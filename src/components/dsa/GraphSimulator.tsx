import type { GraphSimStep } from '../../dsa/types'

type Props = {
  matrix: number[][]
  steps: GraphSimStep[]
  stepIndex: number
  playing: boolean
  onPlay: () => void
  onPause: () => void
  onStep: () => void
  onReset: () => void
}

const PROVINCE_COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc']

/** Fixed layout for up to 5 nodes */
const POSITIONS: Array<{ x: number; y: number }> = [
  { x: 70, y: 50 },
  { x: 200, y: 40 },
  { x: 310, y: 90 },
  { x: 120, y: 170 },
  { x: 260, y: 180 },
]

export function GraphSimulator({
  matrix,
  steps,
  stepIndex,
  playing,
  onPlay,
  onPause,
  onStep,
  onReset,
}: Props) {
  const n = matrix.length
  const step = steps[Math.min(stepIndex, Math.max(steps.length - 1, 0))]
  const edges: Array<[number, number]> = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i]![j] === 1) edges.push([i, j])
    }
  }

  return (
    <div
      className="rounded-md border-2 border-black p-3"
      style={{
        background: 'rgba(8,16,24,0.92)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
      }}
      data-testid="graph-simulator"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-fighter text-[10px] tracking-widest text-[var(--color-gold)]">
          SIMULATOR · GRAPH
        </p>
        <p className="font-fighter text-[9px] text-white/60">
          Step {Math.min(stepIndex + 1, steps.length)} / {steps.length} · Provinces{' '}
          {step?.provinceCount ?? 0}
        </p>
      </div>

      <svg
        viewBox="0 0 380 230"
        className="mt-3 w-full"
        role="img"
        aria-label="Province graph"
      >
        {edges.map(([a, b]) => {
          const pa = POSITIONS[a]!
          const pb = POSITIONS[b]!
          const active =
            step?.activeEdge &&
            ((step.activeEdge[0] === a && step.activeEdge[1] === b) ||
              (step.activeEdge[0] === b && step.activeEdge[1] === a))
          return (
            <line
              key={`${a}-${b}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={active ? '#ffe566' : 'rgba(255,255,255,0.35)'}
              strokeWidth={active ? 4 : 2}
              className={active ? 'graph-edge-active' : undefined}
            />
          )
        })}
        {Array.from({ length: n }, (_, i) => {
          const p = POSITIONS[i]!
          const prov = step?.provinceOf[i]
          const fill =
            prov != null
              ? PROVINCE_COLORS[prov % PROVINCE_COLORS.length]
              : '#64748b'
          const active = step?.activeNode === i
          const visited = step?.visited[i]
          return (
            <g key={i} className={active ? 'graph-node-active' : undefined}>
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 22 : 18}
                fill={fill}
                stroke={active ? '#fff' : visited ? '#e2e8f0' : '#0f172a'}
                strokeWidth={active ? 3 : 2}
                style={{
                  filter: active
                    ? 'drop-shadow(0 0 8px rgba(255,229,102,0.8))'
                    : undefined,
                  transition: 'r 0.25s ease, fill 0.35s ease',
                }}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="#0b1220"
                style={{ fontFamily: 'var(--font-fighter), sans-serif' }}
              >
                {i}
              </text>
            </g>
          )
        })}
      </svg>

      <p
        className="font-body mt-2 min-h-[2.5rem] text-sm leading-snug text-white/90"
        role="status"
      >
        {step?.narration}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {playing ? (
          <button
            type="button"
            className="font-fighter rounded px-3 py-1.5 text-xs text-white"
            style={{ background: '#334155' }}
            onClick={onPause}
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            className="font-fighter rounded px-3 py-1.5 text-xs text-[#1a1208]"
            style={{
              background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
            }}
            onClick={onPlay}
          >
            Play
          </button>
        )}
        <button
          type="button"
          className="font-fighter rounded px-3 py-1.5 text-xs text-white"
          style={{
            background: '#1e3a5f',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
          onClick={onStep}
        >
          Step
        </button>
        <button
          type="button"
          className="font-fighter rounded px-3 py-1.5 text-xs text-white/80"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

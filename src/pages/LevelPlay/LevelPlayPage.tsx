import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLevel } from '../../api/levels'
import { useAudio } from '../../audio/AudioProvider'
import { AudioDock } from '../../components/AudioDock/AudioDock'
import { ClearCelebration } from '../../components/design/ClearCelebration'
import { ComponentPalette } from '../../components/design/ComponentPalette'
import { DesignBoard } from '../../components/design/DesignBoard'
import { LevelHud } from '../../components/design/LevelHud'
import { QuestionRail } from '../../components/design/QuestionRail'
import { canAfford, spentBudget } from '../../levels/budget'
import { evaluateDesign } from '../../levels/evaluate'
import { getNextLevel } from '../../levels/nextLevel'
import type { ComponentKind, Edge, LevelConfig, PlacedNode } from '../../levels/types'

type Mood = 'idle' | 'ok' | 'fail'

export function LevelPlayPage() {
  const { levelId = 'level-1' } = useParams<{ levelId: string }>()
  const { playSfx, armDefaultMusic } = useAudio()
  const [level, setLevel] = useState<LevelConfig | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [nodes, setNodes] = useState<PlacedNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [saying, setSaying] = useState('')
  const [mood, setMood] = useState<Mood>('idle')
  const [simulating, setSimulating] = useState(false)
  const [packetEdgeId, setPacketEdgeId] = useState<string | null>(null)
  const [packetProgress, setPacketProgress] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(90)
  const [timedOut, setTimedOut] = useState(false)
  const celebratedRef = useRef(false)
  const nextLevel = useMemo(() => getNextLevel(levelId), [levelId])

  useEffect(() => {
    let cancelled = false
    setLevel(null)
    setNodes([])
    setEdges([])
    setMood('idle')
    setTimedOut(false)
    setLoadError(null)
    celebratedRef.current = false
    void (async () => {
      try {
        const cfg = await getLevel('social-media', levelId)
        if (cancelled) return
        setLevel(cfg)
        setSaying(cfg.interviewerBubble)
        setSecondsLeft(cfg.timeLimitSec)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load level')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [levelId])

  useEffect(() => {
    if (!level || timedOut || mood === 'ok') return
    if (secondsLeft <= 0) {
      setTimedOut(true)
      setMood('fail')
      setSaying(level.timeUpBubble)
      playSfx('deny')
      return
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [level, secondsLeft, timedOut, mood, playSfx])

  const spent = useMemo(
    () => (level ? spentBudget(level, nodes) : 0),
    [level, nodes],
  )

  const pathEdges = useMemo(() => {
    if (!level) return [] as Edge[]
    const need = level.win.requiredPath
    const byKind = new Map<ComponentKind, PlacedNode[]>()
    for (const n of nodes) {
      const list = byKind.get(n.kind) ?? []
      list.push(n)
      byKind.set(n.kind, list)
    }
    const ordered: PlacedNode[] = []
    for (const k of need) {
      const cand = byKind.get(k)?.[0]
      if (!cand) return edges
      ordered.push(cand)
    }
    const sim: Edge[] = []
    for (let i = 0; i < ordered.length - 1; i++) {
      const from = ordered[i]!
      const to = ordered[i + 1]!
      const found = edges.find((e) => e.from === from.id && e.to === to.id)
      if (found) sim.push(found)
    }
    return sim.length === ordered.length - 1 ? sim : edges
  }, [level, nodes, edges])

  const runSimulation = useCallback(async () => {
    if (!level || simulating || timedOut) return
    setSimulating(true)
    setMood('idle')
    playSfx('click')

    const result = evaluateDesign(level, nodes, edges)
    const animEdges = result.ok
      ? pathEdges
      : edges.slice(0, Math.max(1, edges.length))

    if (animEdges.length === 0 && !result.ok) {
      const msg =
        result.code === 'budget' ? level.overBudgetBubble : level.failBubble
      setSaying(msg)
      setMood('fail')
      playSfx('deny')
      setSimulating(false)
      return
    }

    for (const edge of animEdges) {
      setPacketEdgeId(edge.id)
      for (let p = 0; p <= 12; p++) {
        setPacketProgress(p / 12)
        await new Promise((r) => setTimeout(r, 45))
      }
    }

    setPacketEdgeId(null)
    setPacketProgress(null)

    if (result.ok) {
      setSaying(level.successBubble)
      setMood('ok')
      if (!celebratedRef.current) {
        celebratedRef.current = true
        playSfx('applause')
        window.setTimeout(() => playSfx('victory'), 700)
      }
    } else {
      const msg =
        result.code === 'budget' ? level.overBudgetBubble : level.failBubble
      setSaying(msg)
      setMood('fail')
      playSfx('deny')
    }
    setSimulating(false)
  }, [level, simulating, timedOut, nodes, edges, pathEdges, playSfx])

  if (loadError) {
    return (
      <div className="grid min-h-full place-items-center text-white">
        <p className="font-fighter text-sm">{loadError}</p>
      </div>
    )
  }

  if (!level) {
    return (
      <div className="grid min-h-full place-items-center text-white/80">
        <p className="font-fighter text-xs">Loading level…</p>
      </div>
    )
  }

  return (
    <div
      className="relative flex h-full min-h-full flex-col overflow-hidden"
      onPointerDown={() => {
        void armDefaultMusic()
      }}
    >
      <img
        src={level.backgroundUrl}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'brightness(0.45) saturate(0.9)' }}
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      <AudioDock />

      <div className="relative z-10 flex min-h-0 flex-1">
        {/* ~72% design workspace */}
        <div className="flex min-h-0 min-w-0 flex-[72] flex-col">
          <div className="flex shrink-0 items-start justify-between gap-2 px-2 pt-2 sm:px-3 sm:pt-3">
            <Link
              to="/system-design/social-media"
              className="inline-flex items-center rounded px-3 py-1.5 font-fighter text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(180deg, #8b5a2b 0%, #5c3a18 100%)',
                boxShadow: '0 3px 0 #2a1808',
              }}
              onClick={() => playSfx('click')}
            >
              ← Back
            </Link>
            <div className="text-right">
              <p
                className="font-fighter text-sm font-bold italic text-white sm:text-lg"
                style={{ textShadow: '2px 2px 0 #000' }}
              >
                {level.title}
              </p>
              <p className="font-fighter text-[9px] tracking-widest text-white/75">
                {level.subtitle}
              </p>
            </div>
          </div>

          <div className="mt-1 flex justify-center px-2">
            <LevelHud
              secondsLeft={secondsLeft}
              spent={spent}
              budget={level.budget}
            />
          </div>

          <div className="mt-1 shrink-0">
            <ComponentPalette items={level.palette} />
          </div>

          <div className="relative mx-2 mt-1 flex min-h-0 flex-1 flex-col gap-1.5 pb-2 sm:mx-3">
            {mood === 'ok' ? (
              <ClearCelebration
                next={nextLevel}
                onNextClick={() => playSfx('click')}
              />
            ) : null}
            <DesignBoard
              level={level}
              nodes={nodes}
              edges={edges}
              packetProgress={packetProgress}
              packetEdgeId={packetEdgeId}
              onPlace={(kind, x, y) => {
                if (timedOut || mood === 'ok') return
                if (!canAfford(level, nodes, kind)) {
                  playSfx('deny')
                  setMood('fail')
                  setSaying(level.overBudgetBubble)
                  return
                }
                playSfx('click')
                const id = `n-${crypto.randomUUID()}`
                setNodes((prev) => [...prev, { id, kind, x, y }])
                setMood('idle')
              }}
              onNodeMove={(id, x, y) => {
                setNodes((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, x, y } : n)),
                )
              }}
              onConnect={(fromId, toId) => {
                if (fromId === toId || timedOut) return
                playSfx('enter')
                setEdges((prev) => {
                  if (prev.some((e) => e.from === fromId && e.to === toId)) {
                    return prev
                  }
                  return [
                    ...prev,
                    { id: `e-${crypto.randomUUID()}`, from: fromId, to: toId },
                  ]
                })
              }}
              onNodeRemove={(id) => {
                playSfx('deny')
                setNodes((prev) => prev.filter((n) => n.id !== id))
                setEdges((prev) =>
                  prev.filter((e) => e.from !== id && e.to !== id),
                )
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="Play simulation"
                disabled={simulating || timedOut}
                className="font-fighter rounded px-5 py-2 text-sm font-bold tracking-wide text-[#1a1208] disabled:opacity-60"
                style={{
                  background:
                    'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
                  boxShadow:
                    '0 4px 0 #8a6010, 0 0 20px rgba(232,184,74,0.45), inset 0 1px 0 #fff6',
                }}
                onClick={() => {
                  void runSimulation()
                }}
              >
                ▶ PLAY
              </button>
              <button
                type="button"
                className="font-fighter rounded px-3 py-2 text-[10px] text-white"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
                onClick={() => {
                  playSfx('click')
                  setNodes([])
                  setEdges([])
                  setMood('idle')
                  setTimedOut(false)
                  celebratedRef.current = false
                  setSecondsLeft(level.timeLimitSec)
                  setSaying(level.interviewerBubble)
                }}
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>

        {/* ~28% question rail: 70% question / 30% interviewer */}
        <QuestionRail
          question={level.question}
          saying={saying}
          hints={level.hints}
          mood={mood}
          onHint={() => playSfx('click')}
        />
      </div>
    </div>
  )
}

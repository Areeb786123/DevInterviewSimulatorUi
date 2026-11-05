import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  answerInterview,
  evaluateInterview,
  reviseInterview,
  startInterview,
  type Interview,
  type TechnologyDecision,
} from '../../api/interview'
import { getLevel } from '../../api/levels'
import { useAudio } from '../../audio/AudioProvider'
import { AudioDock } from '../../components/AudioDock/AudioDock'
import { ClearCelebration } from '../../components/design/ClearCelebration'
import { ComponentPalette } from '../../components/design/ComponentPalette'
import { DecisionDialog } from '../../components/design/DecisionDialog'
import { DesignBoard } from '../../components/design/DesignBoard'
import { ExplanationDialog } from '../../components/design/ExplanationDialog'
import { InterviewerAiRail } from '../../components/design/InterviewerAiRail'
import { InterviewerPanel } from '../../components/design/InterviewerPanel'
import { LevelHud } from '../../components/design/LevelHud'
import { NodeLabelDialog } from '../../components/design/NodeLabelDialog'
import { QuestionBriefDialog } from '../../components/design/QuestionBriefDialog'
import {
  ReviewModeDialog,
  type ReviewMode,
} from '../../components/design/ReviewModeDialog'
import {
  buildAutoExplanation,
  formatArchitecturePath,
} from '../../levels/architectureText'
import { canAfford, spentBudget } from '../../levels/budget'
import { evaluateDesign } from '../../levels/evaluate'
import { getNextLevel } from '../../levels/nextLevel'
import type { ComponentKind, Edge, LevelConfig, PlacedNode } from '../../levels/types'

type Mood = 'idle' | 'ok' | 'fail'

function applyInterviewResult(
  interview: Interview,
  opts: {
    setInterview: (i: Interview | null) => void
    setSaying: (s: string) => void
    setMood: (m: Mood) => void
    celebrate: () => void
  },
) {
  opts.setInterview(interview)
  const eval_ = interview.latestEvaluation
  if (interview.status === 'PASSED' || eval_?.passed) {
    opts.setSaying(eval_?.finalFeedback ?? eval_?.summary ?? 'Passed!')
    opts.setMood('ok')
    opts.celebrate()
    return
  }
  if (eval_) {
    opts.setSaying(eval_.summary)
    opts.setMood('fail')
  }
}

export function LevelPlayPage() {
  const location = useLocation()
  const isSandbox = location.pathname === '/system-design/sandbox'
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

  const [decisions, setDecisions] = useState<
    Record<string, TechnologyDecision>
  >({})
  const [explanation, setExplanation] = useState('')
  const [interview, setInterview] = useState<Interview | null>(null)
  const [interviewBusy, setInterviewBusy] = useState(false)
  const [followUpAnswer, setFollowUpAnswer] = useState('')
  const [decisionNodeId, setDecisionNodeId] = useState<string | null>(null)
  const [explanationOpen, setExplanationOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [questionOpen, setQuestionOpen] = useState(false)
  const [labelPrompt, setLabelPrompt] = useState<null | {
    mode: 'create' | 'edit'
    nodeId: string
    initial: string
  }>(null)

  const architecturePreview = useMemo(() => {
    if (!level) return '(empty board)'
    return formatArchitecturePath(nodes, edges, level.palette)
  }, [level, nodes, edges])

  const celebratePass = useCallback(() => {
    if (isSandbox || celebratedRef.current) return
    celebratedRef.current = true
    playSfx('applause')
    window.setTimeout(() => playSfx('victory'), 700)
  }, [playSfx, isSandbox])

  useEffect(() => {
    let cancelled = false
    setLevel(null)
    setNodes([])
    setEdges([])
    setMood('idle')
    setTimedOut(false)
    setLoadError(null)
    setDecisions({})
    setExplanation('')
    setInterview(null)
    setFollowUpAnswer('')
    setDecisionNodeId(null)
    setExplanationOpen(false)
    setLabelPrompt(null)
    celebratedRef.current = false
    void (async () => {
      try {
        const cfg = await getLevel(
          isSandbox ? 'sandbox' : 'social-media',
          isSandbox ? 'playground' : levelId,
        )
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
  }, [levelId, isSandbox])

  useEffect(() => {
    if (isSandbox || !level || level.timeLimitSec <= 0) return
    if (timedOut || mood === 'ok') return
    if (secondsLeft <= 0) {
      setTimedOut(true)
      setMood('fail')
      setSaying(level.timeUpBubble)
      playSfx('deny')
      return
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [isSandbox, level, secondsLeft, timedOut, mood, playSfx])

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

  const buildSubmit = useCallback(
    (mode: ReviewMode) => {
      if (!level) return null
      const path = formatArchitecturePath(nodes, edges, level.palette)
      const auto = buildAutoExplanation(nodes, edges, level)
      const userText = explanation.trim()
      const explanationText = isSandbox
        ? userText
        : mode === 'ultra' && userText
          ? `${auto}\n\nPlayer notes:\n${userText}`
          : auto

      return {
        levelId: level.id,
        mapId: level.mapId,
        components: nodes.map((n) => ({
          id: n.id,
          kind: n.kind,
          x: n.x,
          y: n.y,
          ...(n.label?.trim() ? { label: n.label.trim() } : {}),
        })),
        connections: edges.map((e) => ({
          id: e.id,
          from: e.from,
          to: e.to,
        })),
        decisions: mode === 'ultra' ? Object.values(decisions) : [],
        explanation: explanationText,
        levelContext: {
          title: level.title,
          question: level.question,
          reviewMode: mode,
          architecturePath: path,
          ...(mode === 'base'
            ? {
                win: {
                  requiredPath: level.win.requiredPath,
                  minCounts: level.win.minCounts as
                    | Record<string, number>
                    | undefined,
                },
              }
            : {}),
        },
      }
    },
    [level, nodes, edges, decisions, explanation, isSandbox],
  )

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
      celebratePass()
    } else {
      const msg =
        result.code === 'budget' ? level.overBudgetBubble : level.failBubble
      setSaying(msg)
      setMood('fail')
      playSfx('deny')
    }
    setSimulating(false)
  }, [level, simulating, timedOut, nodes, edges, pathEdges, playSfx, celebratePass])

  const runBaseReview = useCallback(() => {
    if (!level || timedOut || mood === 'ok') return
    playSfx('click')
    const result = evaluateDesign(level, nodes, edges)
    if (result.ok) {
      setSaying(level.successBubble)
      setMood('ok')
      celebratePass()
    } else {
      const msg =
        result.code === 'budget' ? level.overBudgetBubble : level.failBubble
      setSaying(`${msg} (${result.reason})`)
      setMood('fail')
      playSfx('deny')
    }
  }, [level, timedOut, mood, nodes, edges, playSfx, celebratePass])

  const runAiReview = useCallback(
    async (mode: 'ai' | 'ultra') => {
      if (!level || interviewBusy || timedOut) return
      if (!isSandbox && mood === 'ok') return
      if (nodes.length === 0) {
        setSaying('Place at least one component on the board first.')
        setMood('fail')
        playSfx('deny')
        return
      }

      const submit = buildSubmit(mode)
      if (!submit) return

      setInterviewBusy(true)
      playSfx('click')
      setSaying(
        mode === 'ultra'
          ? 'Ultra AI reviewing your architecture…'
          : 'AI reviewing your design path…',
      )

      try {
        let current = interview
        // Backend only accepts evaluate/revise for IN_PROGRESS / NEEDS_REVISION;
        // terminal interviews need a fresh one.
        if (
          current &&
          (current.status === 'PASSED' ||
            current.status === 'FAILED' ||
            current.status === 'ABANDONED')
        ) {
          current = null
        }
        if (!current) {
          const started = await startInterview({
            levelId: level.id,
            mapId: level.mapId,
          })
          if (!started.ok) {
            setSaying(
              started.error === 'backend_offline'
                ? 'AI backend offline. Start: cd dev_interview_simulator_backend && npm run dev'
                : `Interview failed to start: ${started.error}`,
            )
            setMood('fail')
            playSfx('deny')
            return
          }
          current = started.interview
          setInterview(current)
        }

        const isRevise = current.latestEvaluation != null
        const result = isRevise
          ? await reviseInterview(current.id, submit)
          : await evaluateInterview(current.id, submit)

        if (!result.ok) {
          if (result.interview) setInterview(result.interview)
          setSaying(`Interview error: ${result.error}`)
          setMood('fail')
          playSfx('deny')
          return
        }

        applyInterviewResult(result.interview, {
          setInterview,
          setSaying,
          setMood,
          celebrate: celebratePass,
        })
        if (result.localMock) {
          setSaying(
            `${result.interview.latestEvaluation?.summary ?? 'Reviewed.'} (local mock)`,
          )
        }
        if (result.interview.status !== 'PASSED') {
          playSfx('deny')
        }
        setFollowUpAnswer('')
      } catch (e) {
        setSaying(
          e instanceof Error
            ? `Interview request failed: ${e.message}`
            : 'Interview request failed.',
        )
        setMood('fail')
        playSfx('deny')
      } finally {
        setInterviewBusy(false)
      }
    },
    [
      level,
      interviewBusy,
      timedOut,
      mood,
      isSandbox,
      nodes.length,
      buildSubmit,
      interview,
      playSfx,
      celebratePass,
    ],
  )

  const onReviewModeChosen = useCallback(
    (mode: ReviewMode) => {
      setReviewDialogOpen(false)
      if (mode === 'base') {
        runBaseReview()
        return
      }
      void runAiReview(mode)
    },
    [runBaseReview, runAiReview],
  )

  const runAnswerSubmit = useCallback(async () => {
    if (!interview || interviewBusy || !followUpAnswer.trim()) return
    setInterviewBusy(true)
    playSfx('click')
    setSaying('Checking your answer…')
    try {
      const result = await answerInterview(interview.id, followUpAnswer.trim())
      if (!result.ok) {
        if (result.interview) setInterview(result.interview)
        setSaying(`Answer error: ${result.error}`)
        setMood('fail')
        playSfx('deny')
        return
      }
      applyInterviewResult(result.interview, {
        setInterview,
        setSaying,
        setMood,
        celebrate: celebratePass,
      })
      if (result.interview.status !== 'PASSED') {
        playSfx('deny')
      }
      setFollowUpAnswer('')
    } catch (e) {
      setSaying(
        e instanceof Error
          ? `Answer request failed: ${e.message}`
          : 'Answer request failed.',
      )
      setMood('fail')
      playSfx('deny')
    } finally {
      setInterviewBusy(false)
    }
  }, [interview, interviewBusy, followUpAnswer, playSfx, celebratePass])

  const decisionNode = decisionNodeId
    ? nodes.find((n) => n.id === decisionNodeId)
    : undefined
  const decisionLabel =
    decisionNode && level
      ? (level.palette.find((p) => p.kind === decisionNode.kind)?.label ??
        decisionNode.kind)
      : ''

  const showInterviewPanel =
    interview != null &&
    (interview.latestEvaluation != null || interview.pendingFollowUp != null)

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
        {/* Building */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-2 pt-2 sm:px-3 sm:pt-3">
            <Link
              to={isSandbox ? '/' : '/system-design/social-media'}
              className="inline-flex items-center rounded px-3 py-1.5 font-fighter text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(180deg, #8b5a2b 0%, #5c3a18 100%)',
                boxShadow: '0 3px 0 #2a1808',
              }}
              onClick={() => playSfx('click')}
            >
              ← Back
            </Link>
            <button
              type="button"
              className="font-fighter rounded px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#1a1208] sm:text-xs"
              style={{
                background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
                boxShadow: '0 3px 0 #8a6010',
              }}
              aria-label="View question"
              onClick={() => {
                playSfx('click')
                setQuestionOpen(true)
              }}
            >
              VIEW QUESTION
            </button>
            {isSandbox ? null : (
              <LevelHud
                secondsLeft={secondsLeft}
                spent={spent}
                budget={level.budget}
              />
            )}
            <div className="min-w-0 flex-1 text-right sm:flex-none">
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

          <div className="mt-1 shrink-0">
            <ComponentPalette items={level.palette} />
          </div>

          <div className="relative mx-2 mt-1 flex min-h-0 flex-1 flex-col gap-1.5 pb-2 sm:mx-3">
            {mood === 'ok' && !isSandbox ? (
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
                if (timedOut || (!isSandbox && mood === 'ok')) return
                if (!isSandbox && !canAfford(level, nodes, kind)) {
                  playSfx('deny')
                  setMood('fail')
                  setSaying(level.overBudgetBubble)
                  return
                }
                playSfx('click')
                const id = `n-${crypto.randomUUID()}`
                setNodes((prev) => [...prev, { id, kind, x, y }])
                if (isSandbox && kind === 'custom') {
                  setLabelPrompt({ mode: 'create', nodeId: id, initial: '' })
                }
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
                setDecisions((prev) => {
                  const next = { ...prev }
                  delete next[id]
                  return next
                })
                if (decisionNodeId === id) setDecisionNodeId(null)
                setLabelPrompt((prev) => (prev?.nodeId === id ? null : prev))
              }}
              onNodeSelect={(id) => {
                if (timedOut) return
                if (isSandbox) {
                  const node = nodes.find((n) => n.id === id)
                  if (!node) return
                  playSfx('click')
                  setLabelPrompt({
                    mode: 'edit',
                    nodeId: id,
                    initial: node.label ?? '',
                  })
                  return
                }
                if (mood === 'ok') return
                playSfx('click')
                setDecisionNodeId(id)
              }}
            />

            <button
              type="button"
              className="block w-full shrink-0 rounded-md px-3 py-2.5 text-left disabled:opacity-60 sm:py-3"
              style={{
                background:
                  'linear-gradient(160deg, rgba(28,40,58,0.96) 0%, rgba(8,12,20,0.96) 100%)',
                border: explanation.trim()
                  ? '2px solid var(--color-mint)'
                  : '2px solid var(--color-gold)',
                boxShadow:
                  '0 4px 0 #000, 0 0 18px rgba(232,184,74,0.2)',
              }}
              aria-label="Edit architecture explanation"
              disabled={(!isSandbox && mood === 'ok') || timedOut}
              onClick={() => {
                playSfx('click')
                setExplanationOpen(true)
              }}
            >
              <span className="font-fighter flex flex-wrap items-center justify-between gap-2 text-[10px] tracking-[0.16em] text-[var(--color-gold)] sm:text-xs">
                <span>STEP · EXPLAIN YOUR ARCHITECTURE</span>
                <span
                  className="rounded px-2 py-0.5 text-[9px] font-bold text-[#1a1208]"
                  style={{
                    background:
                      'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
                    boxShadow: '0 2px 0 #8a6010',
                  }}
                >
                  {explanation.trim() ? 'EDIT' : 'WRITE'}
                </span>
              </span>
              <span className="font-body mt-1.5 block text-[11px] leading-snug text-white/75 sm:text-xs">
                Tell the data path, why you picked key parts, and one trade-off.
                Interviewer AI reads this.
              </span>
              <span
                className={`font-body mt-2 line-clamp-3 block text-sm leading-snug sm:text-base ${
                  explanation.trim() ? 'text-white' : 'text-white/50'
                }`}
                style={{ textShadow: explanation.trim() ? '0 1px 0 #000' : undefined }}
              >
                {explanation.trim() ||
                  'Tap to explain your design…'}
              </span>
            </button>

            {isSandbox ? null : (
              <p className="font-fighter w-full text-[9px] tracking-wide text-white/55 sm:text-[10px]">
                ▶ PLAY = animate traffic · AI REVIEW = choose Base / AI / Ultra
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {isSandbox ? (
                <button
                  type="button"
                  aria-label="AI Run"
                  disabled={
                    interviewBusy || nodes.length === 0 || !explanation.trim()
                  }
                  className="font-fighter rounded px-5 py-2 text-sm font-bold tracking-wide text-[#1a1208] disabled:opacity-60"
                  style={{
                    background:
                      'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
                    boxShadow:
                      '0 4px 0 #8a6010, 0 0 20px rgba(232,184,74,0.45), inset 0 1px 0 #fff6',
                  }}
                  onClick={() => {
                    if (!explanation.trim()) {
                      playSfx('deny')
                      setSaying('Write your architecture explanation before AI Run.')
                      return
                    }
                    void runAiReview('ai')
                  }}
                >
                  {interviewBusy ? '…' : 'AI Run'}
                </button>
              ) : (
                <>
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
                aria-label="Open AI interview review options"
                title="Choose Base run, AI run, or Ultra AI run"
                disabled={interviewBusy || timedOut || mood === 'ok'}
                className="font-fighter rounded px-4 py-2 text-sm font-bold tracking-wide text-white disabled:opacity-60"
                style={{
                  background:
                    'linear-gradient(180deg, #5a7a9a 0%, #2a4058 100%)',
                  border: '2px solid var(--color-gold)',
                  boxShadow: '0 4px 0 #1a2838',
                }}
                onClick={() => {
                  playSfx('click')
                  setReviewDialogOpen(true)
                }}
              >
                {interviewBusy ? '…' : 'AI REVIEW'}
              </button>
                </>
              )}
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
                  setDecisions({})
                  setExplanation('')
                  setInterview(null)
                  setFollowUpAnswer('')
                  setDecisionNodeId(null)
                  setExplanationOpen(false)
                  setLabelPrompt(null)
                  setReviewDialogOpen(false)
                  setQuestionOpen(false)
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

        {/* Interviewer AI */}
        <InterviewerAiRail
          saying={saying}
          mood={mood}
          panel={
            showInterviewPanel && interview ? (
              <InterviewerPanel
                evaluation={interview.latestEvaluation}
                pendingFollowUp={isSandbox ? null : interview.pendingFollowUp}
                answer={followUpAnswer}
                onAnswerChange={setFollowUpAnswer}
                onSubmitAnswer={() => {
                  void runAnswerSubmit()
                }}
                submitting={interviewBusy}
              />
            ) : undefined
          }
        />
      </div>

      <QuestionBriefDialog
        open={questionOpen}
        question={level.question}
        hints={level.hints}
        onHint={() => playSfx('click')}
        onClose={() => setQuestionOpen(false)}
      />

      <DecisionDialog
        open={decisionNodeId != null && decisionNode != null}
        nodeLabel={decisionLabel}
        componentId={decisionNodeId ?? ''}
        componentKind={decisionNode?.kind}
        initial={decisionNodeId ? decisions[decisionNodeId] : null}
        onCancel={() => setDecisionNodeId(null)}
        onSave={(d) => {
          setDecisions((prev) => ({ ...prev, [d.componentId]: d }))
          setDecisionNodeId(null)
          playSfx('enter')
        }}
      />

      <ExplanationDialog
        open={explanationOpen}
        initial={explanation}
        onCancel={() => setExplanationOpen(false)}
        onSave={(text) => {
          setExplanation(text)
          setExplanationOpen(false)
          playSfx('enter')
        }}
      />

      <NodeLabelDialog
        open={labelPrompt != null}
        title={
          labelPrompt?.mode === 'create' ? 'Name your component' : 'Edit label'
        }
        initial={labelPrompt?.initial ?? ''}
        onCancel={() => {
          if (labelPrompt?.mode === 'create') {
            const id = labelPrompt.nodeId
            setNodes((prev) => prev.filter((n) => n.id !== id))
            setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id))
          }
          setLabelPrompt(null)
        }}
        onSave={(label) => {
          if (!labelPrompt) return
          const id = labelPrompt.nodeId
          setNodes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, label } : n)),
          )
          setLabelPrompt(null)
          playSfx('enter')
        }}
      />

      {isSandbox ? null : (
      <ReviewModeDialog
        open={reviewDialogOpen}
        busy={interviewBusy}
        architecturePreview={architecturePreview}
        onCancel={() => setReviewDialogOpen(false)}
        onChoose={onReviewModeChosen}
      />
      )}
    </div>
  )
}

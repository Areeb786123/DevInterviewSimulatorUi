import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDsaQuestion } from '../../api/dsa'
import { useAudio } from '../../audio/AudioProvider'
import { AudioDock } from '../../components/AudioDock/AudioDock'
import { BallSimulator } from '../../components/dsa/BallSimulator'
import { GraphSimulator } from '../../components/dsa/GraphSimulator'
import { buildProvincesDfsSteps } from '../../dsa/numberOfProvinces'
import {
  evalFindCircleNum,
  runJavascriptProvinces,
  runJavascriptSort,
  type TestRunResult,
} from '../../dsa/runJavascript'
import { simulateUserSort } from '../../dsa/simulateUserSort'
import {
  DSA_LANGUAGES,
  type DsaLanguage,
  type DsaQuestion,
  type GraphSimStep,
  type SimStep,
} from '../../dsa/types'

function idleBallSteps(values: number[]): SimStep[] {
  return [
    {
      values: values.slice(),
      focus: [],
      line: 0,
      narration:
        'Write your sortByAbsoluteValue, then press Play — the balls follow YOUR code (JavaScript). Tip: use .sort(comparator) so we can show each comparison.',
    },
  ]
}

function idleGraphSteps(matrix: number[][]): GraphSimStep[] {
  const n = matrix.length
  return [
    {
      visited: Array.from({ length: n }, () => false),
      provinceOf: Array.from({ length: n }, () => null),
      activeNode: null,
      activeEdge: null,
      provinceCount: 0,
      narration:
        'Press Play to DFS this road map (province coloring). At the end we also run YOUR findCircleNum and compare.',
    },
  ]
}

export function DsaSolvePage() {
  const { questionId = '' } = useParams<{ questionId: string }>()
  const { playSfx, armDefaultMusic } = useAudio()
  const [question, setQuestion] = useState<DsaQuestion | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [language, setLanguage] = useState<DsaLanguage>('javascript')
  const [code, setCode] = useState('')
  const [results, setResults] = useState<TestRunResult[] | null>(null)
  const [runMessage, setRunMessage] = useState<string | null>(null)
  const [ballSteps, setBallSteps] = useState<SimStep[]>([])
  const [graphSteps, setGraphSteps] = useState<GraphSimStep[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [simBusy, setSimBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setQuestion(null)
    setResults(null)
    setRunMessage(null)
    setStepIndex(0)
    setPlaying(false)
    setSimBusy(false)
    void (async () => {
      try {
        const q = await getDsaQuestion(questionId)
        if (cancelled) return
        setQuestion(q)
        setLanguage('javascript')
        setCode(q.starterCode.javascript)
        if (q.kind === 'array-sort') setBallSteps(idleBallSteps(q.simValues))
        else setGraphSteps(idleGraphSteps(q.simMatrix))
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [questionId])

  const activeStepCount =
    question?.kind === 'array-sort' ? ballSteps.length : graphSteps.length

  useEffect(() => {
    if (!playing || activeStepCount === 0) return
    if (stepIndex >= activeStepCount - 1) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => {
      setStepIndex((s) => s + 1)
    }, 780)
    return () => window.clearTimeout(id)
  }, [playing, stepIndex, activeStepCount])

  function rebuildSim(autoPlay: boolean) {
    if (!question) return
    if (language !== 'javascript') {
      setRunMessage('Simulator runs JavaScript for now — switch language to JS')
      playSfx('deny')
      return
    }
    setRunMessage(null)
    setSimBusy(true)

    if (question.kind === 'array-sort') {
      const out = simulateUserSort(code, question.simValues)
      setBallSteps(out.steps)
      setStepIndex(0)
      setSimBusy(false)
      if (out.error) {
        playSfx('deny')
        setPlaying(false)
        return
      }
      playSfx('click')
      setPlaying(autoPlay)
      return
    }

    // Graph: DFS pedagogy on sim matrix + append user result
    const steps = buildProvincesDfsSteps(question.simMatrix)
    const user = evalFindCircleNum(code, question.simMatrix)
    const last = steps[steps.length - 1]!
    if (user.error) {
      steps.push({
        ...last,
        narration: `Your findCircleNum error: ${user.error}`,
      })
    } else {
      const ok = user.value === last.provinceCount
      steps.push({
        ...last,
        narration: ok
          ? `Your findCircleNum returned ${user.value} — matches the graph walk.`
          : `Your findCircleNum returned ${user.value}, but the walk found ${last.provinceCount}.`,
      })
    }
    setGraphSteps(steps)
    setStepIndex(0)
    setSimBusy(false)
    playSfx(user.error || user.value !== last.provinceCount ? 'deny' : 'click')
    setPlaying(autoPlay)
  }

  function resetSimIdle() {
    if (!question) return
    setPlaying(false)
    setStepIndex(0)
    if (question.kind === 'array-sort') {
      setBallSteps(idleBallSteps(question.simValues))
    } else {
      setGraphSteps(idleGraphSteps(question.simMatrix))
    }
  }

  if (loadError) {
    return (
      <div className="grid min-h-full place-items-center text-white">
        <p className="font-fighter text-sm">{loadError}</p>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="grid min-h-full place-items-center text-white/80">
        <p className="font-fighter text-xs">Loading question…</p>
      </div>
    )
  }

  const canRun = question.runnable.includes(language)

  return (
    <div
      className="relative flex h-full min-h-full flex-col overflow-hidden"
      onPointerDown={() => {
        void armDefaultMusic()
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, #1a3355 0%, #0a121c 55%, #060a10 100%)',
        }}
      />
      <AudioDock />

      <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <Link
          to="/dsa"
          className="font-fighter inline-flex rounded px-3 py-1.5 text-sm font-bold text-white"
          style={{
            background: 'linear-gradient(180deg, #8b5a2b 0%, #5c3a18 100%)',
            boxShadow: '0 3px 0 #2a1808',
          }}
          onClick={() => playSfx('click')}
        >
          ← Questions
        </Link>
        <div className="text-right">
          <p
            className="font-fighter text-sm font-bold text-white sm:text-lg"
            style={{ textShadow: '2px 2px 0 #000' }}
          >
            {question.title}
          </p>
          <p className="font-fighter text-[9px] tracking-widest text-white/70">
            {question.difficulty} · DSA
          </p>
        </div>
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 gap-3 overflow-hidden px-3 pb-3 sm:grid-cols-2 sm:px-4 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          <section
            className="rounded-md border-2 border-black p-3"
            style={{ background: 'rgba(12,22,36,0.95)' }}
          >
            <p className="font-fighter text-[10px] tracking-widest text-[var(--color-gold)]">
              QUESTION
            </p>
            <p className="font-body mt-2 whitespace-pre-wrap text-sm leading-snug text-white">
              {question.statement}
            </p>
            {question.examples.map((ex, i) => (
              <div key={i} className="mt-3 rounded bg-black/35 p-2">
                <p className="font-fighter text-[10px] text-[var(--color-mint)]">
                  Example {i + 1}
                </p>
                <p className="font-body mt-1 text-xs text-white/90">
                  Input: {ex.input}
                </p>
                <p className="font-body text-xs text-white/90">
                  Output: {ex.output}
                </p>
                <p className="font-body mt-1 whitespace-pre-wrap text-xs text-white/70">
                  {ex.explanation}
                </p>
              </div>
            ))}
          </section>

          {question.kind === 'array-sort' ? (
            <BallSimulator
              steps={ballSteps}
              stepIndex={stepIndex}
              playing={playing}
              onPlay={() => rebuildSim(true)}
              onPause={() => {
                playSfx('click')
                setPlaying(false)
              }}
              onStep={() => {
                if (ballSteps.length <= 1 || stepIndex >= ballSteps.length - 1) {
                  rebuildSim(false)
                  setStepIndex(1)
                  setPlaying(false)
                  return
                }
                playSfx('click')
                setPlaying(false)
                setStepIndex((s) => Math.min(s + 1, ballSteps.length - 1))
              }}
              onReset={() => {
                playSfx('click')
                resetSimIdle()
              }}
            />
          ) : (
            <GraphSimulator
              matrix={question.simMatrix}
              steps={graphSteps}
              stepIndex={stepIndex}
              playing={playing}
              onPlay={() => rebuildSim(true)}
              onPause={() => {
                playSfx('click')
                setPlaying(false)
              }}
              onStep={() => {
                if (
                  graphSteps.length <= 1 ||
                  stepIndex >= graphSteps.length - 1
                ) {
                  rebuildSim(false)
                  setStepIndex(1)
                  setPlaying(false)
                  return
                }
                playSfx('click')
                setPlaying(false)
                setStepIndex((s) => Math.min(s + 1, graphSteps.length - 1))
              }}
              onReset={() => {
                playSfx('click')
                resetSimIdle()
              }}
            />
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <label className="font-fighter text-[10px] text-white/70">
              Language
              <select
                className="ml-2 rounded border border-white/20 bg-[#0f172a] px-2 py-1 font-body text-sm text-white"
                value={language}
                aria-label="Language"
                onChange={(e) => {
                  const next = e.target.value as DsaLanguage
                  setLanguage(next)
                  setCode(question.starterCode[next])
                  setResults(null)
                  setRunMessage(null)
                  resetSimIdle()
                  playSfx('click')
                }}
              >
                {DSA_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="font-fighter rounded px-4 py-1.5 text-sm font-bold text-[#1a1208]"
              style={{
                background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
                boxShadow: '0 3px 0 #8a6010',
              }}
              onClick={() => {
                playSfx('click')
                if (!canRun) {
                  setRunMessage('Runner coming soon for this language')
                  setResults(null)
                  playSfx('deny')
                  return
                }
                setRunMessage(null)
                const out =
                  question.kind === 'array-sort'
                    ? runJavascriptSort(code, question.tests)
                    : runJavascriptProvinces(code, question.tests)
                setResults(out)
                playSfx(out.every((r) => r.ok) ? 'enter' : 'deny')
              }}
            >
              ▶ Run
            </button>
            <button
              type="button"
              className="font-fighter rounded px-3 py-1.5 text-xs text-white"
              style={{
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid #fff3',
              }}
              onClick={() => {
                playSfx('click')
                setCode(question.starterCode[language])
                setResults(null)
                resetSimIdle()
              }}
            >
              Reset code
            </button>
          </div>

          <p className="font-fighter text-[9px] tracking-wide text-white/55">
            YOUR CODE {simBusy ? '· RUNNING…' : playing ? '· SIMULATING…' : ''}
          </p>
          <textarea
            aria-label="Code editor"
            className="min-h-[14rem] flex-1 resize-none rounded-md border-2 bg-[#0b1220] p-3 font-mono text-xs leading-5 text-[#e2e8f0] outline-none focus:border-[var(--color-gold)] sm:text-sm"
            style={{
              borderColor: playing ? 'var(--color-gold)' : '#000',
              boxShadow: playing
                ? '0 0 0 1px var(--color-gold), 0 0 18px rgba(232,184,74,0.35)'
                : undefined,
            }}
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {runMessage ? (
            <p
              className="font-fighter text-xs text-[var(--color-arcade-red)]"
              role="status"
            >
              {runMessage}
            </p>
          ) : null}

          <section
            className="max-h-48 overflow-y-auto rounded-md border-2 border-black p-2"
            style={{ background: 'rgba(12,22,36,0.95)' }}
            aria-label="Test cases"
          >
            <p className="font-fighter text-[10px] tracking-widest text-[var(--color-gold)]">
              TEST CASES
            </p>
            <ul className="mt-2 space-y-2">
              {question.tests.map((t) => {
                const r = results?.find((x) => x.id === t.id)
                const preview =
                  question.kind === 'array-sort'
                    ? `in [${(t as { input: number[] }).input.join(', ')}] → [${(t as { expected: number[] }).expected.join(', ')}]`
                    : `matrix ${(t as { input: number[][] }).input.length}×${(t as { input: number[][] }).input.length} → ${(t as { expected: number }).expected}`
                return (
                  <li
                    key={t.id}
                    className="rounded bg-black/30 px-2 py-1.5 text-xs text-white/90"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-fighter">
                        {t.hidden ? 'Hidden' : t.label}
                      </span>
                      {r ? (
                        <span
                          className="font-fighter"
                          style={{
                            color: r.ok
                              ? 'var(--color-mint)'
                              : 'var(--color-arcade-red)',
                          }}
                        >
                          {r.ok ? 'PASS' : 'FAIL'}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </div>
                    {!t.hidden ? (
                      <p className="mt-1 text-white/60">{preview}</p>
                    ) : null}
                    {r?.error ? (
                      <p className="mt-1 text-[var(--color-arcade-red)]">
                        {r.error}
                      </p>
                    ) : null}
                    {r && !r.ok && r.actual ? (
                      <p className="mt-1 text-white/70">got {r.actual}</p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

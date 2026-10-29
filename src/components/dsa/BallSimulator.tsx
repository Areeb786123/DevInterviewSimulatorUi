import { useEffect, useRef, useState } from 'react'
import type { SimStep } from '../../dsa/types'

type Props = {
  steps: SimStep[]
  stepIndex: number
  playing: boolean
  onPlay: () => void
  onPause: () => void
  onStep: () => void
  onReset: () => void
}

type Ball = {
  id: number
  value: number
  slot: number
}

const BALL_COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc']
const SLOT_PITCH = 72
const BALL_SIZE = 56

function ballsFromValues(values: number[]): Ball[] {
  return values.map((value, slot) => ({ id: slot, value, slot }))
}

export function BallSimulator({
  steps,
  stepIndex,
  playing,
  onPlay,
  onPause,
  onStep,
  onReset,
}: Props) {
  const step = steps[Math.min(stepIndex, Math.max(steps.length - 1, 0))]
  const values = step?.values ?? []
  const [balls, setBalls] = useState<Ball[]>(() => ballsFromValues(values))
  const [swapPair, setSwapPair] = useState<[number, number] | null>(null)
  const prevIndexRef = useRef(stepIndex)
  const stepsRef = useRef(steps)
  stepsRef.current = steps

  // Rebuild identities when the step list is replaced (new Play / Reset)
  useEffect(() => {
    const first = steps[0]?.values
    if (!first) {
      setBalls([])
      return
    }
    setBalls(ballsFromValues(first))
    setSwapPair(null)
    prevIndexRef.current = 0
  }, [steps])

  // Animate slot moves when the active step changes
  useEffect(() => {
    const s = stepsRef.current[stepIndex]
    if (!s) return

    const prev = prevIndexRef.current
    prevIndexRef.current = stepIndex

    if (s.swapped) {
      const [i, j] = s.swapped
      setSwapPair([i, j])
      setBalls((prevBalls) => {
        if (prevBalls.length !== s.values.length) {
          return ballsFromValues(s.values)
        }
        return prevBalls.map((b) => {
          if (b.slot === i) return { ...b, slot: j }
          if (b.slot === j) return { ...b, slot: i }
          return b
        })
      })
      const clear = window.setTimeout(() => setSwapPair(null), 520)
      return () => window.clearTimeout(clear)
    }

    // Non-swap step: snap values to slots (no identity jump unless reset jump)
    if (stepIndex < prev || Math.abs(stepIndex - prev) > 1) {
      setBalls(ballsFromValues(s.values))
      setSwapPair(null)
      return
    }

    setBalls((prevBalls) => {
      if (prevBalls.length !== s.values.length) return ballsFromValues(s.values)
      return prevBalls.map((b) => ({
        ...b,
        value: s.values[b.slot] ?? b.value,
      }))
    })
    setSwapPair(null)
  }, [stepIndex])

  const focus = step?.focus ?? []
  const trackWidth = Math.max(values.length, 1) * SLOT_PITCH

  return (
    <div
      className="rounded-md border-2 border-black p-3"
      style={{
        background: 'rgba(8,16,24,0.92)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
      }}
      data-testid="ball-simulator"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-fighter text-[10px] tracking-widest text-[var(--color-gold)]">
          SIMULATOR · 5 BALLS
        </p>
        <p className="font-fighter text-[9px] text-white/60">
          Step {Math.min(stepIndex + 1, steps.length)} / {steps.length}
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div
          className="relative mx-auto"
          style={{ width: trackWidth, height: 108 }}
        >
          {/* Slot pads — fixed index houses */}
          {values.map((_, i) => (
            <div
              key={`slot-${i}`}
              className="pointer-events-none absolute bottom-0 flex flex-col items-center"
              style={{
                left: i * SLOT_PITCH + (SLOT_PITCH - BALL_SIZE) / 2,
                width: BALL_SIZE,
              }}
            >
              <div
                className="h-2 w-10 rounded-full"
                style={{
                  background: focus.includes(i)
                    ? 'rgba(125,211,252,0.55)'
                    : 'rgba(255,255,255,0.12)',
                }}
              />
              <span className="font-fighter mt-1 text-[8px] text-white/45">
                i={i}
              </span>
            </div>
          ))}

          {/* Swap arc hint */}
          {swapPair ? (
            <div
              className="ball-swap-arc pointer-events-none absolute top-2"
              style={{
                left:
                  Math.min(swapPair[0], swapPair[1]) * SLOT_PITCH +
                  SLOT_PITCH / 2,
                width: Math.abs(swapPair[0] - swapPair[1]) * SLOT_PITCH,
              }}
              aria-hidden
            />
          ) : null}

          {/* Moving balls */}
          {balls.map((b) => {
            const focused = focus.includes(b.slot)
            // After we assign new slots, highlight the two balls now sitting in the swapped indices
            const isMoving =
              swapPair != null &&
              (b.slot === swapPair[0] || b.slot === swapPair[1])

            return (
              <div
                key={b.id}
                className={`ball-token absolute top-1 ${isMoving ? 'ball-token-swap' : focused ? 'ball-token-focus' : ''}`}
                style={{
                  left: b.slot * SLOT_PITCH + (SLOT_PITCH - BALL_SIZE) / 2,
                  width: BALL_SIZE,
                  height: BALL_SIZE,
                  background: BALL_COLORS[b.id % BALL_COLORS.length],
                  boxShadow: isMoving
                    ? '0 0 0 3px #fff, 0 0 20px rgba(255,220,100,0.85)'
                    : focused
                      ? '0 0 0 3px #fff, 0 0 14px rgba(125,211,252,0.75)'
                      : '0 5px 0 rgba(0,0,0,0.45)',
                  zIndex: isMoving || focused ? 5 : 1,
                }}
                aria-label={`ball value ${b.value} at index ${b.slot}`}
              >
                <span className="font-fighter text-base font-bold text-[#0b1220] sm:text-lg">
                  {b.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <p
        className="font-body mt-2 min-h-[2.5rem] text-sm leading-snug text-white/90"
        role="status"
      >
        {step?.narration}
        {swapPair ? (
          <span className="mt-1 block font-fighter text-[10px] tracking-wide text-[var(--color-gold)]">
            Swapping slots i={swapPair[0]} ↔ i={swapPair[1]}
          </span>
        ) : null}
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

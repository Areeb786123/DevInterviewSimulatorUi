import { useEffect, useMemo, useState } from 'react'

export type FighterRole = 'candidate' | 'interviewer'

type AnimatedFighterProps = {
  role: FighterRole
  facing?: 'left' | 'right'
  ready?: boolean
  label: string
  labelColor: string
}

const FRAMES: Record<
  FighterRole,
  { idle: string[]; action: string[]; actionMs: number; idleMs: number }
> = {
  candidate: {
    idle: Array.from({ length: 4 }, (_, i) =>
      `/assets/fighters/candidate/idle/idle_${String(i).padStart(2, '0')}.png`,
    ),
    action: Array.from({ length: 3 }, (_, i) =>
      `/assets/fighters/candidate/punch/punch_${String(i).padStart(2, '0')}.png`,
    ),
    idleMs: 160,
    actionMs: 90,
  },
  interviewer: {
    idle: Array.from({ length: 4 }, (_, i) =>
      `/assets/fighters/interviewer/idle/idle_${String(i).padStart(2, '0')}.png`,
    ),
    action: Array.from({ length: 4 }, (_, i) =>
      `/assets/fighters/interviewer/punch/punch_${String(i).padStart(2, '0')}.png`,
    ),
    idleMs: 150,
    actionMs: 100,
  },
}

export function AnimatedFighter({
  role,
  facing = 'right',
  ready = false,
  label,
  labelColor,
}: AnimatedFighterProps) {
  const pack = FRAMES[role]
  const [mode, setMode] = useState<'idle' | 'action'>('idle')
  const [frame, setFrame] = useState(0)

  const frames = useMemo(
    () => (mode === 'idle' ? pack.idle : pack.action),
    [mode, pack],
  )

  useEffect(() => {
    ;[...pack.idle, ...pack.action].forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [pack])

  useEffect(() => {
    const ms = mode === 'idle' ? pack.idleMs : pack.actionMs
    const id = window.setInterval(() => {
      setFrame((f) => {
        const next = f + 1
        if (mode === 'action' && next >= frames.length) {
          setMode('idle')
          return 0
        }
        return next % frames.length
      })
    }, ms)
    return () => window.clearInterval(id)
  }, [mode, frames.length, pack.idleMs, pack.actionMs])

  useEffect(() => {
    const delay = role === 'candidate' ? 2000 : 2800
    const first = role === 'candidate' ? 700 : 1400
    let loop = 0
    const kick = window.setTimeout(() => {
      setMode('action')
      setFrame(0)
      loop = window.setInterval(() => {
        setMode('action')
        setFrame(0)
      }, delay)
    }, first)
    return () => {
      window.clearTimeout(kick)
      if (loop) window.clearInterval(loop)
    }
  }, [role])

  const src = frames[Math.min(frame, frames.length - 1)]
  const flip = facing === 'left'

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${ready ? 'motion-safe-ready' : ''}`}
        style={{ width: 180, height: 200 }}
      >
        <img
          src={src}
          alt={label}
          className="pixelated absolute bottom-0 left-1/2 h-[190px] w-auto max-w-none"
          style={{
            transform: `translateX(-50%) ${flip ? 'scaleX(-1)' : ''}`,
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />
      </div>
      <p
        className="font-display mt-1 text-[8px] sm:text-[10px]"
        style={{ color: labelColor, textShadow: '2px 2px 0 #000' }}
      >
        {label}
      </p>
    </div>
  )
}

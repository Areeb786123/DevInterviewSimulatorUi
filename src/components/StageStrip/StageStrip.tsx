import { useCallback, useEffect } from 'react'
import { useAudio } from '../../audio/AudioProvider'
import type { Stage } from '../../stages/stages'
import { StageCard } from '../StageCard/StageCard'

export type StageStripProps = {
  stages: Stage[]
  focusedId: string
  onFocusChange: (id: string) => void
  onConfirm: (id: string) => void
}

export function StageStrip({
  stages,
  focusedId,
  onFocusChange,
  onConfirm,
}: StageStripProps) {
  const { playSfx, unlockAudio } = useAudio()

  const confirmStage = useCallback(
    async (id: string) => {
      await unlockAudio()
      const stage = stages.find((s) => s.id === id)
      if (!stage) return
      if (stage.locked) {
        playSfx('deny')
        return
      }
      playSfx('enter')
      onConfirm(id)
    },
    [stages, unlockAudio, playSfx, onConfirm],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const idx = stages.findIndex((s) => s.id === focusedId)
      if (idx < 0) return

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        if (idx >= stages.length - 1) return
        const next = stages[idx + 1]!
        playSfx('click')
        onFocusChange(next.id)
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        if (idx <= 0) return
        const prev = stages[idx - 1]!
        playSfx('click')
        onFocusChange(prev.id)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        void confirmStage(focusedId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focusedId, stages, onFocusChange, playSfx, confirmStage])

  return (
    <div
      className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-2.5"
      role="listbox"
      aria-label="System design stages"
      tabIndex={0}
    >
      {stages.map((stage) => (
        <div key={stage.id} role="option" aria-selected={stage.id === focusedId}>
          <StageCard
            stage={stage}
            focused={stage.id === focusedId}
            onFocus={() => {
              if (stage.id !== focusedId) {
                playSfx('click')
                onFocusChange(stage.id)
              }
            }}
            onConfirm={() => {
              void confirmStage(stage.id)
            }}
          />
        </div>
      ))}
    </div>
  )
}

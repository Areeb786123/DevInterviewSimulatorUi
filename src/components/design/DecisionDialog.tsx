import { useEffect, useState } from 'react'
import type { TechnologyDecision } from '../../api/interview'
import { getTechnologyMeta } from '../../levels/technologyCatalog'
import type { ComponentKind } from '../../levels/types'

export type DecisionDialogProps = {
  open: boolean
  nodeLabel: string
  componentId: string
  componentKind?: ComponentKind | null
  initial?: Partial<TechnologyDecision> | null
  onSave: (decision: TechnologyDecision) => void
  onCancel: () => void
}

const fieldClass =
  'font-body mt-0.5 w-full rounded border border-white/20 bg-black/40 px-2 py-1.5 text-sm text-white placeholder:text-white/40 focus:border-[var(--color-gold)] focus:outline-none'

const labelClass =
  'font-fighter text-[9px] tracking-wide text-[var(--color-gold)]'

export function DecisionDialog({
  open,
  nodeLabel,
  componentId,
  componentKind,
  initial,
  onSave,
  onCancel,
}: DecisionDialogProps) {
  const [technology, setTechnology] = useState('')
  const [whyChosen, setWhyChosen] = useState('')
  const [advantages, setAdvantages] = useState('')
  const [disadvantages, setDisadvantages] = useState('')
  const [alternatives, setAlternatives] = useState('')
  const [bottleneck, setBottleneck] = useState('')

  const meta = componentKind ? getTechnologyMeta(componentKind) : null

  useEffect(() => {
    if (!open) return
    const m = componentKind ? getTechnologyMeta(componentKind) : null
    setTechnology(initial?.technology ?? nodeLabel)
    setWhyChosen(initial?.whyChosen ?? '')
    setAdvantages(
      initial?.advantages ?? (m ? m.strengths.slice(0, 2).join('; ') : ''),
    )
    setDisadvantages(
      initial?.disadvantages ?? (m ? m.weaknesses.slice(0, 2).join('; ') : ''),
    )
    setAlternatives(
      initial?.alternatives ?? (m ? m.alternatives.slice(0, 3).join(', ') : ''),
    )
    setBottleneck(initial?.bottleneck ?? '')
  }, [open, initial, nodeLabel, componentKind])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Technology decision"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close dialog backdrop"
        onClick={onCancel}
      />
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-md"
        style={{
          background: 'rgba(10, 16, 26, 0.98)',
          border: '3px solid var(--color-gold)',
          boxShadow: '0 8px 0 #000, 0 0 28px rgba(232,184,74,0.25)',
        }}
      >
        <div className="shrink-0 border-b border-white/15 px-3 py-2.5">
          <p className="font-fighter text-xs tracking-[0.16em] text-[var(--color-gold)]">
            TECH DECISION
          </p>
          <p
            className="font-fighter mt-0.5 text-sm text-white"
            style={{ textShadow: '1px 1px 0 #000' }}
          >
            {nodeLabel}
          </p>
          {meta ? (
            <p className="font-body mt-1.5 text-xs leading-snug text-white/75">
              {meta.primaryPurpose} Use when: {meta.useWhen}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
          <label className="block">
            <span className={labelClass}>TECHNOLOGY</span>
            <input
              className={fieldClass}
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              placeholder="e.g. PostgreSQL, NGINX…"
              aria-label="Technology"
            />
          </label>
          <label className="block">
            <span className={labelClass}>WHY CHOSEN</span>
            <textarea
              className={`${fieldClass} min-h-[3rem] resize-y`}
              value={whyChosen}
              onChange={(e) => setWhyChosen(e.target.value)}
              aria-label="Why chosen"
            />
          </label>
          <label className="block">
            <span className={labelClass}>ADVANTAGES</span>
            <textarea
              className={`${fieldClass} min-h-[2.5rem] resize-y`}
              value={advantages}
              onChange={(e) => setAdvantages(e.target.value)}
              aria-label="Advantages"
            />
          </label>
          <label className="block">
            <span className={labelClass}>DISADVANTAGES</span>
            <textarea
              className={`${fieldClass} min-h-[2.5rem] resize-y`}
              value={disadvantages}
              onChange={(e) => setDisadvantages(e.target.value)}
              aria-label="Disadvantages"
            />
          </label>
          <label className="block">
            <span className={labelClass}>ALTERNATIVES</span>
            <textarea
              className={`${fieldClass} min-h-[2.5rem] resize-y`}
              value={alternatives}
              onChange={(e) => setAlternatives(e.target.value)}
              aria-label="Alternatives"
            />
          </label>
          <label className="block">
            <span className={labelClass}>BOTTLENECK</span>
            <textarea
              className={`${fieldClass} min-h-[2.5rem] resize-y`}
              value={bottleneck}
              onChange={(e) => setBottleneck(e.target.value)}
              aria-label="Bottleneck"
            />
          </label>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-white/15 px-3 py-2.5">
          <button
            type="button"
            className="font-fighter rounded px-3 py-1.5 text-[10px] text-white"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
            onClick={onCancel}
          >
            CANCEL
          </button>
          <button
            type="button"
            className="font-fighter rounded px-4 py-1.5 text-[10px] font-bold text-[#1a1208]"
            style={{
              background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
              boxShadow: '0 3px 0 #8a6010',
            }}
            onClick={() => {
              onSave({
                componentId,
                technology: technology.trim() || nodeLabel,
                whyChosen: whyChosen.trim(),
                advantages: advantages.trim(),
                disadvantages: disadvantages.trim(),
                alternatives: alternatives.trim(),
                bottleneck: bottleneck.trim(),
              })
            }}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}

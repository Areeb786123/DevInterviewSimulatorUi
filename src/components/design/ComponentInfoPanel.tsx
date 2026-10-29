import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { ComponentKnowledge } from '../../levels/componentKnowledge/types'

export type ComponentInfoPanelProps = {
  open: boolean
  knowledge: ComponentKnowledge | null
  onClose: () => void
}

type SectionId =
  | 'overview'
  | 'why'
  | 'how'
  | 'architecture'
  | 'when'
  | 'whenNot'
  | 'tradeoffs'
  | 'alternatives'
  | 'scaling'
  | 'failures'
  | 'interview'
  | 'takeaways'

const SECTIONS: { id: SectionId; label: string; badge?: string }[] = [
  { id: 'overview', label: 'Overview', badge: 'Beginner' },
  { id: 'why', label: 'Why does it exist?' },
  { id: 'how', label: 'How it works', badge: 'Intermediate' },
  { id: 'architecture', label: 'Real-world architecture' },
  { id: 'when', label: 'When should you use it?' },
  { id: 'whenNot', label: 'When should you NOT use it?' },
  { id: 'tradeoffs', label: 'Advantages & disadvantages' },
  { id: 'alternatives', label: 'Alternatives & comparisons' },
  { id: 'scaling', label: 'Scaling & performance', badge: 'Advanced' },
  { id: 'failures', label: 'Failure scenarios' },
  { id: 'interview', label: 'Interview questions', badge: 'Interview Tip' },
  { id: 'takeaways', label: 'Key takeaways' },
]

function Badge({ children }: { children: string }) {
  return (
    <span
      className="font-fighter ml-2 rounded px-1.5 py-0.5 text-[8px] tracking-wide text-[#1a1208]"
      style={{
        background:
          children === 'Interview Tip'
            ? 'linear-gradient(180deg, #7dcfb6 0%, #4a9a82 100%)'
            : children === 'Advanced'
              ? 'linear-gradient(180deg, #ff8a7a 0%, #c44 100%)'
              : 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
      }}
    >
      {children}
    </span>
  )
}

function Accordion({
  id,
  label,
  badge,
  open,
  onToggle,
  children,
}: {
  id: string
  label: string
  badge?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="border-b border-white/10">
      <button
        type="button"
        id={`${id}-btn`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="flex w-full items-center justify-between gap-2 px-1 py-3 text-left"
        onClick={onToggle}
      >
        <span className="font-fighter flex flex-wrap items-center text-[11px] tracking-[0.12em] text-[var(--color-gold)] sm:text-xs">
          {label}
          {badge ? <Badge>{badge}</Badge> : null}
        </span>
        <span className="font-fighter text-white/70" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-btn`}
          className="space-y-3 pb-4 pl-1 pr-1"
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}

function Body({ children }: { children: ReactNode }) {
  return (
    <p className="font-body text-sm leading-relaxed text-white/90">{children}</p>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="font-body list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-white/90">
      {items.map((item) => (
        <li key={item.slice(0, 48)}>{item}</li>
      ))}
    </ul>
  )
}

export function ComponentInfoPanel({
  open,
  knowledge,
  onClose,
}: ComponentInfoPanelProps) {
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  /** One open section at a time — accordion style. */
  const [openSection, setOpenSection] = useState<SectionId | null>('overview')

  useEffect(() => {
    if (!open) return
    setOpenSection('overview')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, knowledge?.id])

  if (!open || !knowledge) return null

  function toggle(id: SectionId) {
    setOpenSection((prev) => (prev === id ? null : id))
  }

  const k = knowledge

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        aria-label="Close component info"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-lg sm:rounded-md"
        style={{
          background: 'rgba(8, 14, 24, 0.98)',
          border: '3px solid var(--color-gold)',
          boxShadow: '0 10px 0 #000, 0 0 32px rgba(232,184,74,0.28)',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-white/15 px-4 py-3 sm:px-5">
          <img
            src={k.iconUrl}
            alt=""
            className="h-12 w-12 shrink-0 drop-shadow-md sm:h-14 sm:w-14"
            draggable={false}
          />
          <div className="min-w-0 flex-1">
            <p className="font-fighter text-[10px] tracking-[0.18em] text-[var(--color-gold)]">
              COMPONENT GUIDE · {k.category.toUpperCase()}
            </p>
            <h2
              id={titleId}
              className="font-fighter mt-0.5 text-xl text-white sm:text-2xl"
              style={{ textShadow: '1px 1px 0 #000' }}
            >
              {k.name}
            </h2>
            <p className="font-body mt-1 text-xs leading-snug text-white/70 sm:text-sm">
              {k.shortDescription}
            </p>
          </div>
          <button
            type="button"
            className="font-fighter shrink-0 rounded px-3 py-1.5 text-[10px] text-white"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
            onClick={onClose}
          >
            CLOSE
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-1 sm:px-5">
          {SECTIONS.map((s) => (
            <Accordion
              key={s.id}
              id={`comp-info-${s.id}`}
              label={s.label}
              badge={s.badge}
              open={openSection === s.id}
              onToggle={() => toggle(s.id)}
            >
              {s.id === 'overview' ? (
                <>
                  <div>
                    <p className="font-fighter text-[9px] tracking-[0.14em] text-[#7dcfb6]">
                      BEGINNER
                    </p>
                    <Body>{k.beginnerExplanation}</Body>
                  </div>
                  <div>
                    <p className="font-fighter text-[9px] tracking-[0.14em] text-white/55">
                      TECHNICAL
                    </p>
                    <Body>{k.technicalExplanation}</Body>
                  </div>
                  <Body>
                    <span className="font-fighter text-[var(--color-gold)]">
                      Primary job:{' '}
                    </span>
                    {k.purpose}
                  </Body>
                </>
              ) : null}

              {s.id === 'why' ? (
                <>
                  <Body>
                    <span className="font-fighter text-[var(--color-gold)]">
                      Problem before:{' '}
                    </span>
                    {k.problemBefore}
                  </Body>
                  <Body>
                    <span className="font-fighter text-[var(--color-gold)]">
                      After adding it:{' '}
                    </span>
                    {k.whatChanges}
                  </Body>
                  <Body>{k.optionalNote}</Body>
                </>
              ) : null}

              {s.id === 'how' ? (
                <ol className="font-body list-decimal space-y-2 pl-5 text-sm leading-relaxed text-white/90">
                  {k.howItWorks.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              ) : null}

              {s.id === 'architecture' ? (
                <div className="space-y-3">
                  {k.architectureExamples.map((ex) => (
                    <div
                      key={ex.title}
                      className="rounded-md px-3 py-2"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <p className="font-fighter text-[10px] text-[var(--color-gold)]">
                        {ex.title}
                      </p>
                      <p className="font-fighter mt-1 text-xs text-[#7dcfb6]">
                        {ex.path}
                      </p>
                      <Body>{ex.explanation}</Body>
                    </div>
                  ))}
                  {k.relatedComponents.length > 0 ? (
                    <p className="font-body text-xs text-white/60">
                      Related in this game:{' '}
                      {k.relatedComponents.join(' · ')}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {s.id === 'when' ? <BulletList items={k.useCases} /> : null}
              {s.id === 'whenNot' ? (
                <BulletList items={k.whenNotToUse} />
              ) : null}

              {s.id === 'tradeoffs' ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                    <thead>
                      <tr>
                        <th className="font-fighter border-b border-white/20 px-2 py-2 text-[10px] tracking-wide text-[#7dcfb6]">
                          ADVANTAGES
                        </th>
                        <th className="font-fighter border-b border-white/20 px-2 py-2 text-[10px] tracking-wide text-[#ff8a7a]">
                          DISADVANTAGES
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({
                        length: Math.max(
                          k.advantages.length,
                          k.disadvantages.length,
                        ),
                      }).map((_, i) => (
                        <tr key={i} className="align-top">
                          <td className="font-body border-b border-white/10 px-2 py-2 text-white/90">
                            {k.advantages[i] ? (
                              <>
                                <strong className="text-white">
                                  {k.advantages[i]!.point}.
                                </strong>{' '}
                                {k.advantages[i]!.detail}
                              </>
                            ) : null}
                          </td>
                          <td className="font-body border-b border-white/10 px-2 py-2 text-white/90">
                            {k.disadvantages[i] ? (
                              <>
                                <strong className="text-white">
                                  {k.disadvantages[i]!.point}.
                                </strong>{' '}
                                {k.disadvantages[i]!.detail}
                              </>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {s.id === 'alternatives' ? (
                <ul className="space-y-2">
                  {k.alternatives.map((a) => (
                    <li
                      key={a.name}
                      className="font-body rounded-md px-3 py-2 text-sm text-white/90"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <span className="font-fighter text-[var(--color-gold)]">
                        {a.name}
                      </span>
                      {' — '}
                      {a.when}
                    </li>
                  ))}
                </ul>
              ) : null}

              {s.id === 'scaling' ? <Body>{k.scaling}</Body> : null}
              {s.id === 'failures' ? (
                <BulletList items={k.failureScenarios} />
              ) : null}

              {s.id === 'interview' ? (
                <div className="space-y-3">
                  {k.interviewQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="rounded-md px-3 py-2.5"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <p className="font-fighter text-[9px] tracking-wide text-[#7dcfb6]">
                        {q.level.toUpperCase()}
                      </p>
                      <p className="font-fighter mt-1 text-sm text-white">
                        Q{i + 1}. {q.question}
                      </p>
                      <p className="font-body mt-2 text-xs text-white/65">
                        <span className="text-[var(--color-gold)]">Tests:</span>{' '}
                        {q.testing}
                      </p>
                      <p className="font-body mt-1 text-xs text-white/65">
                        <span className="text-[var(--color-gold)]">
                          Cover:
                        </span>{' '}
                        {q.keyConcepts.join(', ')}
                      </p>
                      <p className="font-body mt-2 text-sm text-white/90">
                        <span className="font-fighter text-[10px] text-[var(--color-gold)]">
                          SAMPLE:{' '}
                        </span>
                        {q.sampleAnswer}
                      </p>
                      <p className="font-body mt-1 text-xs text-[#ff8a7a]">
                        Avoid: {q.commonMistakes.join('; ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {s.id === 'takeaways' ? (
                <>
                  <BulletList items={k.keyTakeaways} />
                  <Body>
                    <span className="font-fighter text-[var(--color-gold)]">
                      Biggest trade-off:{' '}
                    </span>
                    {k.biggestTradeOff}
                  </Body>
                  <p
                    className="font-body rounded-md px-3 py-2 text-sm text-white"
                    style={{
                      background: 'rgba(125,207,182,0.12)',
                      border: '1px solid rgba(125,207,182,0.35)',
                    }}
                  >
                    <span className="font-fighter text-[10px] text-[#7dcfb6]">
                      INTERVIEW TIP —{' '}
                    </span>
                    {k.interviewTip}
                  </p>
                </>
              ) : null}
            </Accordion>
          ))}
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-white/15 px-4 py-3">
          <button
            type="button"
            className="font-fighter rounded px-5 py-2 text-xs font-bold text-[#1a1208]"
            style={{
              background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
              boxShadow: '0 3px 0 #8a6010',
            }}
            onClick={onClose}
          >
            GOT IT
          </button>
        </footer>
      </div>
    </div>
  )
}

import type { EvaluationResult, FollowUpQuestion } from '../../api/interview'

export type InterviewerPanelProps = {
  evaluation: EvaluationResult | null
  pendingFollowUp: FollowUpQuestion | null
  answer: string
  onAnswerChange: (value: string) => void
  onSubmitAnswer: () => void
  submitting?: boolean
}

export function InterviewerPanel({
  evaluation,
  pendingFollowUp,
  answer,
  onAnswerChange,
  onSubmitAnswer,
  submitting = false,
}: InterviewerPanelProps) {
  if (!evaluation && !pendingFollowUp) {
    return (
      <p className="font-body text-sm leading-snug text-white/70">
        Submit your design for Interviewer AI evaluation.
      </p>
    )
  }

  // Interactive answer UI only when the page explicitly passes a pending follow-up
  // (sandbox passes null). Never fall back to evaluation.followUpQuestion.
  const followUp = pendingFollowUp
  const passed = evaluation?.passed === true

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto text-left">
      {evaluation ? (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="font-fighter rounded px-2 py-0.5 text-[10px] tracking-[0.14em]"
              style={{
                color: passed ? '#0b1a14' : '#fff',
                background: passed
                  ? 'var(--color-mint)'
                  : 'var(--color-arcade-red)',
                boxShadow: '0 2px 0 #000',
              }}
            >
              {passed ? 'PASS' : 'HOLD'}
            </span>
            <p
              className="font-fighter text-xl leading-none"
              style={{
                color: passed ? 'var(--color-mint)' : 'var(--color-gold)',
                textShadow: '1px 1px 0 #000',
              }}
              aria-label={`Score ${evaluation.score} out of 10`}
            >
              {evaluation.score}
              <span className="text-sm text-white/50">/10</span>
            </p>
          </div>

          <p
            className="font-body text-sm leading-snug text-white"
            style={{ textShadow: '0 1px 1px #000' }}
          >
            {evaluation.summary}
          </p>

          {evaluation.strengths.length > 0 ? (
            <div>
              <p className="font-fighter text-[9px] tracking-wide text-[var(--color-mint)]">
                STRENGTHS
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-3.5">
                {evaluation.strengths.map((s) => (
                  <li key={s} className="font-body text-xs leading-snug text-white/90">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {evaluation.weaknesses.length > 0 ? (
            <div>
              <p className="font-fighter text-[9px] tracking-wide text-[var(--color-arcade-red)]">
                WEAKNESSES
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-3.5">
                {evaluation.weaknesses.map((w) => (
                  <li key={w} className="font-body text-xs leading-snug text-white/90">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {evaluation.suggestedImprovements.length > 0 ? (
            <div>
              <p className="font-fighter text-[9px] tracking-wide text-[var(--color-gold)]">
                IMPROVE
              </p>
              <ul className="mt-1 space-y-1.5">
                {evaluation.suggestedImprovements.map((imp) => (
                  <li key={imp.title} className="font-body text-xs leading-snug text-white/90">
                    <span className="font-semibold text-white">{imp.title}</span>
                    {imp.description ? ` — ${imp.description}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {passed && evaluation.finalFeedback ? (
            <p
              className="font-body rounded px-2 py-1.5 text-xs leading-snug text-white"
              style={{
                background: 'rgba(125,207,182,0.15)',
                border: '1px solid var(--color-mint)',
              }}
            >
              {evaluation.finalFeedback}
            </p>
          ) : null}
        </>
      ) : null}

      {followUp && !passed ? (
        <div className="mt-auto space-y-2 border-t border-white/15 pt-2.5">
          <p className="font-fighter text-[9px] tracking-[0.16em] text-[var(--color-gold)]">
            FOLLOW-UP
          </p>
          <p className="font-body text-sm leading-snug text-white">
            {followUp.question}
          </p>
          <textarea
            className="font-body w-full resize-y rounded border border-white/15 bg-black/35 px-2.5 py-2 text-sm text-white placeholder:text-white/35 focus:border-[var(--color-gold)] focus:outline-none"
            rows={4}
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Your answer…"
            aria-label="Follow-up answer"
            disabled={submitting}
          />
          <button
            type="button"
            className="font-fighter w-full rounded px-3 py-2 text-[11px] font-bold tracking-wide text-[#1a1208] disabled:opacity-55"
            style={{
              background: 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
              boxShadow: '0 3px 0 #8a6010',
            }}
            disabled={submitting || !answer.trim()}
            onClick={onSubmitAnswer}
          >
            {submitting ? 'SUBMITTING…' : 'SUBMIT ANSWER'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

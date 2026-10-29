import { MissAiHintPanel } from './MissAiHintPanel'

export type QuestionRailProps = {
  question: string
  hints: string[]
  onHint?: () => void
}

const SECTION_RE =
  /(?:^|\n\n)(SCENARIO|PROBLEM RIGHT NOW|WHAT TO SOLVE)\n([\s\S]*?)(?=\n\n(?:SCENARIO|PROBLEM RIGHT NOW|WHAT TO SOLVE)|$)/g

function parseQuestionSections(question: string) {
  const sections: { title: string; body: string }[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(SECTION_RE.source, 'g')
  while ((match = re.exec(question)) !== null) {
    sections.push({ title: match[1]!, body: match[2]!.trim() })
  }
  return sections
}

function QuestionBody({ question }: { question: string }) {
  const sections = parseQuestionSections(question)
  if (sections.length === 0) {
    return (
      <p
        className="font-body whitespace-pre-wrap text-sm leading-snug text-white/95"
        style={{ textShadow: '0 1px 0 #000' }}
      >
        {question}
      </p>
    )
  }

  const accent: Record<string, string> = {
    SCENARIO: '#7dd3fc',
    'PROBLEM RIGHT NOW': '#fca5a5',
    'WHAT TO SOLVE': '#86efac',
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.map((s) => (
        <section key={s.title}>
          <p
            className="font-fighter text-[9px] tracking-[0.18em]"
            style={{ color: accent[s.title] ?? 'var(--color-gold)' }}
          >
            {s.title}
          </p>
          <p
            className="font-body mt-1 whitespace-pre-wrap text-sm leading-snug text-white/95"
            style={{ textShadow: '0 1px 0 #000' }}
          >
            {s.body}
          </p>
        </section>
      ))}
    </div>
  )
}

/** Middle column: level brief + Miss AI hints. */
export function QuestionRail({ question, hints, onHint }: QuestionRailProps) {
  return (
    <aside
      className="flex h-full min-h-0 w-[22%] min-w-[11rem] shrink-0 flex-col overflow-hidden sm:min-w-[13rem]"
      style={{
        background:
          'linear-gradient(180deg, rgba(10,16,26,0.98) 0%, rgba(6,10,16,0.98) 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '-8px 0 20px rgba(0,0,0,0.35)',
      }}
      aria-label="Level question"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 py-2.5">
        <p className="font-fighter shrink-0 text-[10px] tracking-[0.2em] text-[var(--color-gold)]">
          QUESTION
        </p>
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-0.5">
          <QuestionBody question={question} />
        </div>
        <MissAiHintPanel hints={hints} onHint={onHint} />
      </div>
    </aside>
  )
}

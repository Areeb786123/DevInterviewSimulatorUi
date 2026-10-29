import { MissAiHintPanel } from './MissAiHintPanel'

export type QuestionRailProps = {
  question: string
  saying: string
  hints: string[]
  mood?: 'idle' | 'ok' | 'fail'
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
        className="font-body whitespace-pre-wrap text-sm leading-snug text-white sm:text-base"
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
            className="font-fighter text-[9px] tracking-[0.16em] sm:text-[10px]"
            style={{ color: accent[s.title] ?? 'var(--color-gold)' }}
          >
            {s.title}
          </p>
          <p
            className="font-body mt-1 whitespace-pre-wrap text-sm leading-snug text-white sm:text-[15px]"
            style={{ textShadow: '0 1px 0 #000' }}
          >
            {s.body}
          </p>
        </section>
      ))}
    </div>
  )
}

export function QuestionRail({
  question,
  saying,
  hints,
  mood = 'idle',
  onHint,
}: QuestionRailProps) {
  const ring =
    mood === 'ok'
      ? 'var(--color-mint)'
      : mood === 'fail'
        ? 'var(--color-arcade-red)'
        : 'var(--color-gold)'

  return (
    <aside
      className="flex h-full min-h-0 w-[28%] min-w-[12rem] shrink-0 flex-col overflow-hidden sm:min-w-[14rem]"
      style={{
        background: 'rgba(6, 10, 18, 0.94)',
        borderLeft: '3px solid rgba(255,255,255,0.2)',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.45)',
      }}
      aria-label="Level question and interviewer"
    >
      <div
        className="flex min-h-0 flex-[7] flex-col overflow-hidden border-b-2 border-white/15 px-2 py-2 sm:px-2.5"
        style={{ background: 'rgba(12, 22, 36, 0.95)' }}
      >
        <p className="font-fighter shrink-0 text-[10px] tracking-[0.2em] text-[var(--color-gold)] sm:text-xs">
          QUESTION
        </p>
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
          <QuestionBody question={question} />
        </div>

        <MissAiHintPanel hints={hints} onHint={onHint} />
      </div>

      <div
        className="flex min-h-0 flex-[3] flex-col overflow-hidden px-2.5 py-2.5"
        style={{
          borderTop: `2px solid ${ring}`,
          background: 'rgba(18, 28, 42, 0.98)',
        }}
      >
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full sm:h-12 sm:w-12"
            style={{
              border: `3px solid ${ring}`,
              boxShadow: '0 2px 0 #000',
              background: '#1a2433',
            }}
          >
            <img
              src="/assets/fighters/interviewer/idle/idle_00.png"
              alt=""
              className="h-full w-full object-cover object-top"
              style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }}
              draggable={false}
            />
          </div>
          <p className="font-fighter text-[10px] tracking-wide text-[var(--color-gold)] sm:text-xs">
            INTERVIEWER
          </p>
        </div>
        <div
          className="mt-2 min-h-0 flex-1 overflow-y-auto rounded-md px-2.5 py-2"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: `2px solid ${ring}`,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
          }}
          role="status"
        >
          <p
            className="font-body text-sm leading-snug text-white sm:text-base"
            style={{ textShadow: '0 1px 2px #000' }}
          >
            {saying}
          </p>
        </div>
      </div>
    </aside>
  )
}

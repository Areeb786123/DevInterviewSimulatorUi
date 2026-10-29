const SECTION_RE =
  /(?:^|\n\n)(SCENARIO|PROBLEM RIGHT NOW|WHAT TO SOLVE)\n([\s\S]*?)(?=\n\n(?:SCENARIO|PROBLEM RIGHT NOW|WHAT TO SOLVE)|$)/g

export function parseQuestionSections(question: string) {
  const sections: { title: string; body: string }[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(SECTION_RE.source, 'g')
  while ((match = re.exec(question)) !== null) {
    sections.push({ title: match[1]!, body: match[2]!.trim() })
  }
  return sections
}

/** One-line preview for the compact rail (prefer WHAT TO SOLVE). */
export function questionTeaser(question: string): string {
  const sections = parseQuestionSections(question)
  const solve = sections.find((s) => s.title === 'WHAT TO SOLVE')
  const text = (solve?.body ?? sections[0]?.body ?? question).trim()
  const firstLine = text.split('\n').find((l) => l.trim()) ?? text
  return firstLine.length > 110 ? `${firstLine.slice(0, 107)}…` : firstLine
}

const ACCENT: Record<string, string> = {
  SCENARIO: '#7dd3fc',
  'PROBLEM RIGHT NOW': '#fca5a5',
  'WHAT TO SOLVE': '#86efac',
}

export function QuestionBody({ question }: { question: string }) {
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

  return (
    <div className="flex flex-col gap-3">
      {sections.map((s) => (
        <section key={s.title}>
          <p
            className="font-fighter text-[9px] tracking-[0.18em]"
            style={{ color: ACCENT[s.title] ?? 'var(--color-gold)' }}
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

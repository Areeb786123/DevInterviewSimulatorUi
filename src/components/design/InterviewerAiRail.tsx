import type { ReactNode } from 'react'

export type InterviewerAiRailProps = {
  saying: string
  mood?: 'idle' | 'ok' | 'fail'
  /** When set, replaces the idle saying bubble (evaluation / follow-up). */
  panel?: ReactNode
}

/** Right column: Interviewer AI feedback. */
export function InterviewerAiRail({
  saying,
  mood = 'idle',
  panel,
}: InterviewerAiRailProps) {
  const ring =
    mood === 'ok'
      ? 'var(--color-mint)'
      : mood === 'fail'
        ? 'var(--color-arcade-red)'
        : 'var(--color-gold)'

  return (
    <aside
      className="flex h-full min-h-0 w-[24%] min-w-[12rem] shrink-0 flex-col overflow-hidden sm:min-w-[14rem]"
      style={{
        background:
          'linear-gradient(180deg, rgba(12,18,28,0.98) 0%, rgba(8,12,18,0.98) 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '-10px 0 24px rgba(0,0,0,0.4)',
      }}
      aria-label="Interviewer AI"
    >
      <div
        className="flex shrink-0 items-center gap-2.5 px-2.5 py-2.5"
        style={{
          borderBottom: `2px solid ${ring}`,
          background: 'rgba(14, 22, 34, 0.96)',
        }}
      >
        <div
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full"
          style={{
            border: `2px solid ${ring}`,
            boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 14px ${ring}40`,
            background: '#121a26',
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
        <div className="min-w-0">
          <p className="font-fighter text-[10px] tracking-[0.16em] text-[var(--color-gold)]">
            INTERVIEWER AI
          </p>
          <p className="font-body text-[10px] text-white/45">
            {panel ? 'Reviewing your design' : 'Ready when you submit'}
          </p>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2.5 py-2.5"
        role="status"
      >
        <div
          className="flex min-h-0 flex-1 flex-col rounded px-2.5 py-2.5"
          style={{
            background: 'rgba(0,0,0,0.28)',
            border: `1px solid ${ring}55`,
          }}
        >
          {panel ? (
            panel
          ) : (
            <p
              className="font-body text-sm leading-snug text-white"
              style={{ textShadow: '0 1px 2px #000' }}
            >
              {saying}
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}

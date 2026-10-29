export type InterviewerCoachProps = {
  message: string
  mood?: 'idle' | 'ok' | 'fail'
}

export function InterviewerCoach({
  message,
  mood = 'idle',
}: InterviewerCoachProps) {
  const ring =
    mood === 'ok'
      ? 'var(--color-mint)'
      : mood === 'fail'
        ? 'var(--color-arcade-red)'
        : 'var(--color-gold)'

  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-30 flex max-w-[min(100%,22rem)] items-end gap-2 sm:bottom-5 sm:right-5">
      <div
        className="relative rounded-lg px-3 py-2"
        style={{
          background: 'rgba(8,12,20,0.94)',
          border: `2px solid ${ring}`,
          boxShadow: `0 0 18px ${ring}55, 0 6px 0 #000`,
        }}
        role="status"
      >
        <p
          className="font-fighter text-[9px] leading-relaxed text-white sm:text-[10px]"
          style={{ textShadow: '0 1px 0 #000' }}
        >
          {message}
        </p>
        <span
          className="absolute -right-1 bottom-4 h-3 w-3 rotate-45"
          style={{ background: ring }}
          aria-hidden
        />
      </div>
      <div
        className="relative shrink-0 overflow-hidden rounded-full"
        style={{
          width: 72,
          height: 72,
          border: `3px solid ${ring}`,
          boxShadow: '0 4px 0 #000',
          background: '#1a2433',
        }}
      >
        <img
          src="/assets/fighters/interviewer/idle/idle_00.png"
          alt="Interviewer"
          className="pixelated h-full w-full object-cover object-top"
          style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }}
          draggable={false}
        />
      </div>
    </div>
  )
}

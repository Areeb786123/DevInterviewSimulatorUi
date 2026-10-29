export type StageConfirmStubProps = {
  stageLabel: string
}

export function StageConfirmStub({ stageLabel }: StageConfirmStubProps) {
  return (
    <div
      className="absolute left-1/2 top-3 z-20 -translate-x-1/2 px-4 py-2 text-center sm:top-5"
      style={{
        background: 'rgba(6, 12, 22, 0.88)',
        border: '1px solid var(--color-neon)',
        boxShadow: '0 0 16px rgba(79,210,255,0.35)',
      }}
      role="status"
    >
      <p className="font-fighter text-sm font-bold italic tracking-wide text-[var(--color-neon)] sm:text-base">
        {stageLabel} — SELECTED
      </p>
      <p className="font-fighter mt-0.5 text-[11px] tracking-widest text-white/70">
        LEVEL 1 — COMING SOON
      </p>
    </div>
  )
}

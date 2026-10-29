export type MicButtonProps = {
  listening: boolean
  supported: boolean
  onToggle: () => void
  disabled?: boolean
}

function MicIcon({ listening }: { listening: boolean }) {
  if (listening) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
      </svg>
    )
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" stroke="none" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  )
}

export function MicButton({
  listening,
  supported,
  onToggle,
  disabled,
}: MicButtonProps) {
  if (!supported) {
    return (
      <span
        className="font-fighter text-[9px] text-white/45"
        title="Speech-to-text not available in this browser"
      >
        MIC N/A
      </span>
    )
  }

  return (
    <button
      type="button"
      aria-label={listening ? 'Stop dictation' : 'Start dictation'}
      aria-pressed={listening}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-50"
      style={{
        background: listening
          ? 'linear-gradient(180deg, #ff8a7a 0%, #c44 100%)'
          : 'linear-gradient(180deg, #ffe566 0%, #e8b84a 100%)',
        border: '2px solid #1a1208',
        boxShadow: listening
          ? '0 0 14px rgba(255,100,80,0.55), 0 3px 0 #000'
          : '0 3px 0 #000',
        color: '#1a1208',
      }}
      onClick={onToggle}
    >
      <MicIcon listening={listening} />
    </button>
  )
}

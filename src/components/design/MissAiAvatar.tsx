/** Inline SVG so Miss AI always renders (no broken public asset path). */
export function MissAiAvatar({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="22"
        y="28"
        width="52"
        height="48"
        rx="10"
        fill="#4fd2ff"
        stroke="#0b1a33"
        strokeWidth="3"
      />
      <circle cx="48" cy="48" r="18" fill="#f2f8ff" stroke="#0b1a33" strokeWidth="3" />
      <circle cx="48" cy="48" r="2.5" fill="#0b1a33" />
      <path d="M48 48 V34" stroke="#0b1a33" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 48 L58 52" stroke="#e8b84a" strokeWidth="3" strokeLinecap="round" />
      <rect
        x="36"
        y="14"
        width="24"
        height="12"
        rx="4"
        fill="#7dcfb6"
        stroke="#0b1a33"
        strokeWidth="2"
      />
      <circle cx="48" cy="12" r="4" fill="#ffe566" stroke="#0b1a33" strokeWidth="2" />
      <rect
        x="14"
        y="40"
        width="10"
        height="20"
        rx="3"
        fill="#3a7bd5"
        stroke="#0b1a33"
        strokeWidth="2"
      />
      <rect
        x="72"
        y="40"
        width="10"
        height="20"
        rx="3"
        fill="#3a7bd5"
        stroke="#0b1a33"
        strokeWidth="2"
      />
      <circle cx="38" cy="42" r="2" fill="#0b1a33" />
      <circle cx="58" cy="42" r="2" fill="#0b1a33" />
    </svg>
  )
}

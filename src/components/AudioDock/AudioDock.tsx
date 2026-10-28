import { useAudio } from '../../audio/AudioProvider'

function SoundOnIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none">
      <path d="M4 9v6h3l5 4V5L7 9H4z" fill="currentColor" />
      <path
        d="M16 8.5a4.5 4.5 0 0 1 0 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.5 6a8 8 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SoundOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none">
      <path d="M4 9v6h3l5 4V5L7 9H4z" fill="currentColor" />
      <path
        d="M17 9l4 6M21 9l-4 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AudioDock() {
  const { muted, volume, musicOn, setVolume, enableMusic, disableMusic, unlockAudio } =
    useAudio()

  const isOn = musicOn && !muted

  return (
    <div
      className="absolute right-2 top-2 z-40 flex items-center gap-2 border-2 border-black px-2 py-1 sm:right-4 sm:top-3"
      style={{
        background: 'rgba(8, 16, 24, 0.92)',
        boxShadow: '2px 2px 0 #000',
      }}
    >
      <button
        type="button"
        aria-label={isOn ? 'Mute sound' : 'Unmute sound'}
        title={isOn ? 'Sound on' : 'Sound off'}
        className="flex items-center justify-center text-[var(--color-gold)]"
        onClick={(e) => {
          e.stopPropagation()
          void (async () => {
            if (isOn) {
              disableMusic()
              return
            }
            await enableMusic()
          })()
        }}
      >
        {isOn ? <SoundOnIcon /> : <SoundOffIcon />}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        aria-label="Volume"
        className="w-16 accent-[var(--color-gold)] sm:w-24"
        onPointerDown={() => {
          void unlockAudio()
        }}
        onChange={(e) => setVolume(Number(e.target.value))}
      />
    </div>
  )
}

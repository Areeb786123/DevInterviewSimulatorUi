import { useAudio } from '../../audio/AudioProvider'

export function AudioDock() {
  const {
    muted,
    volume,
    musicOn,
    setMuted,
    setVolume,
    enableMusic,
    disableMusic,
    unlockAudio,
    playSfx,
  } = useAudio()

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
        aria-label={musicOn && !muted ? 'Turn music off' : 'Turn music on'}
        className="font-display text-[7px] text-[var(--color-gold)] sm:text-[9px]"
        onClick={() => {
          void (async () => {
            if (musicOn && !muted) {
              disableMusic()
              setMuted(true)
              return
            }
            await enableMusic()
            playSfx('click')
          })()
        }}
      >
        {musicOn && !muted ? 'MUSIC ON' : 'MUSIC OFF'}
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

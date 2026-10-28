import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AudioManager } from './AudioManager'
import { saveAudioPrefs } from './storage'
import type { SfxName } from './types'

type AudioContextValue = {
  unlocked: boolean
  muted: boolean
  volume: number
  musicOn: boolean
  unlockAudio: () => Promise<void>
  enableMusic: () => Promise<void>
  disableMusic: () => void
  playSfx: (name: SfxName) => void
  setMuted: (muted: boolean) => void
  setVolume: (volume: number) => void
  armDefaultMusic: () => Promise<void>
}

const AudioContext = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const manager = useMemo(
    () =>
      new AudioManager({
        bgmUrl: '/assets/audio/bgm.wav',
        sfx: {
          click: '/assets/audio/click.wav',
          deny: '/assets/audio/deny.wav',
          enter: '/assets/audio/enter.wav',
        },
      }),
    [],
  )

  const armedRef = useRef(false)
  const [unlocked, setUnlocked] = useState(false)
  // Always ON visually on every open/refresh
  const [musicOn, setMusicOn] = useState(true)
  const [muted, setMutedState] = useState(false)
  const [volume, setVolumeState] = useState(() => manager.getPrefs().volume)

  useEffect(() => () => manager.dispose(), [manager])

  const persistVolume = useCallback(
    (vol: number) => {
      saveAudioPrefs({
        muted: false,
        volume: vol,
        musicOn: true,
      })
    },
    [],
  )

  const unlockAudio = useCallback(async () => {
    await manager.unlock()
    if (manager.isUnlocked()) setUnlocked(true)
  }, [manager])

  const enableMusic = useCallback(async () => {
    await manager.unlock()
    if (!manager.isUnlocked()) return
    setUnlocked(true)
    manager.setMuted(false)
    setMutedState(false)
    setMusicOn(true)
    manager.playBgm()
    armedRef.current = true
  }, [manager])

  const disableMusic = useCallback(() => {
    manager.stopBgm()
    manager.setMuted(true)
    setMutedState(true)
    setMusicOn(false)
    armedRef.current = false
  }, [manager])

  const armDefaultMusic = useCallback(async () => {
    // If user muted this session, do nothing
    if (!musicOn || muted) return
    if (armedRef.current && manager.isBgmPlaying()) return
    await enableMusic()
  }, [musicOn, muted, manager, enableMusic])

  const playSfx = useCallback(
    (name: SfxName) => {
      manager.playSfx(name)
    },
    [manager],
  )

  const setMuted = useCallback(
    (next: boolean) => {
      if (next) {
        disableMusic()
      } else {
        void enableMusic()
      }
    },
    [disableMusic, enableMusic],
  )

  const setVolume = useCallback(
    (next: number) => {
      manager.setVolume(next)
      const vol = manager.getPrefs().volume
      setVolumeState(vol)
      persistVolume(vol)
    },
    [manager, persistVolume],
  )

  const value = useMemo(
    () => ({
      unlocked,
      muted,
      volume,
      musicOn,
      unlockAudio,
      enableMusic,
      disableMusic,
      playSfx,
      setMuted,
      setVolume,
      armDefaultMusic,
    }),
    [
      unlocked,
      muted,
      volume,
      musicOn,
      unlockAudio,
      enableMusic,
      disableMusic,
      playSfx,
      setMuted,
      setVolume,
      armDefaultMusic,
    ],
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}

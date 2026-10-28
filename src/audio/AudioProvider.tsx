import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AudioManager } from './AudioManager'
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

  const [unlocked, setUnlocked] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [muted, setMutedState] = useState(() => manager.getPrefs().muted)
  const [volume, setVolumeState] = useState(() => manager.getPrefs().volume)

  useEffect(() => () => manager.dispose(), [manager])

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
    manager.playBgm()
    setMusicOn(true)
  }, [manager])

  const disableMusic = useCallback(() => {
    manager.stopBgm()
    setMusicOn(false)
  }, [manager])

  const playSfx = useCallback(
    (name: SfxName) => {
      manager.playSfx(name)
    },
    [manager],
  )

  const setMuted = useCallback(
    (next: boolean) => {
      manager.setMuted(next)
      setMutedState(next)
      if (next) {
        setMusicOn(false)
      }
    },
    [manager],
  )

  const setVolume = useCallback(
    (next: number) => {
      manager.setVolume(next)
      setVolumeState(manager.getPrefs().volume)
    },
    [manager],
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
    ],
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}

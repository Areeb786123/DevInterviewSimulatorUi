import type { AudioPrefs } from './types'

export const AUDIO_PREFS_KEY = 'dis.audio.prefs'

const DEFAULTS: AudioPrefs = { muted: false, volume: 70 }

export function clampVolume(n: number): number {
  if (Number.isNaN(n)) return DEFAULTS.volume
  return Math.min(100, Math.max(0, Math.round(n)))
}

export function loadAudioPrefs(): AudioPrefs {
  const raw = localStorage.getItem(AUDIO_PREFS_KEY)
  if (!raw) return { ...DEFAULTS }
  try {
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>
    return {
      muted: Boolean(parsed.muted),
      volume: clampVolume(
        typeof parsed.volume === 'number' ? parsed.volume : DEFAULTS.volume,
      ),
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveAudioPrefs(prefs: AudioPrefs): void {
  const next: AudioPrefs = {
    muted: Boolean(prefs.muted),
    volume: clampVolume(prefs.volume),
  }
  localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(next))
}

import type { AudioPrefs } from './types'

export const AUDIO_PREFS_KEY = 'dis.audio.prefs'

const DEFAULTS: AudioPrefs = { muted: false, volume: 70, musicOn: true }

export function clampVolume(n: number): number {
  if (Number.isNaN(n)) return DEFAULTS.volume
  return Math.min(100, Math.max(0, Math.round(n)))
}

export function loadAudioPrefs(): AudioPrefs {
  const raw = localStorage.getItem(AUDIO_PREFS_KEY)
  let volume = DEFAULTS.volume
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<AudioPrefs>
      if (typeof parsed.volume === 'number') {
        volume = clampVolume(parsed.volume)
      }
    } catch {
      // ignore corrupt prefs; keep defaults
    }
  }

  // Every refresh / open: music is ON by default (volume is the only persisted value)
  return {
    muted: false,
    volume,
    musicOn: true,
  }
}

export function saveAudioPrefs(prefs: AudioPrefs): void {
  // Persist volume only so refresh always boots with music on
  const next = {
    volume: clampVolume(prefs.volume),
  }
  localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(next))
}

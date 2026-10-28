import { describe, it, expect, beforeEach } from 'vitest'
import {
  AUDIO_PREFS_KEY,
  clampVolume,
  loadAudioPrefs,
  saveAudioPrefs,
} from './storage'

describe('clampVolume', () => {
  it('clamps below 0 to 0', () => {
    expect(clampVolume(-5)).toBe(0)
  })
  it('clamps above 100 to 100', () => {
    expect(clampVolume(140)).toBe(100)
  })
  it('rounds to nearest int', () => {
    expect(clampVolume(33.6)).toBe(34)
  })
})

describe('audio prefs storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when empty', () => {
    expect(loadAudioPrefs()).toEqual({ muted: false, volume: 70 })
  })

  it('round-trips mute and volume', () => {
    saveAudioPrefs({ muted: true, volume: 40 })
    expect(loadAudioPrefs()).toEqual({ muted: true, volume: 40 })
    expect(localStorage.getItem(AUDIO_PREFS_KEY)).toBeTruthy()
  })

  it('ignores corrupt JSON and returns defaults', () => {
    localStorage.setItem(AUDIO_PREFS_KEY, '{not-json')
    expect(loadAudioPrefs()).toEqual({ muted: false, volume: 70 })
  })
})

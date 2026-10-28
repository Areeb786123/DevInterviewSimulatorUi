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

  it('returns music on by default', () => {
    expect(loadAudioPrefs()).toEqual({
      muted: false,
      volume: 70,
      musicOn: true,
    })
  })

  it('preserves volume but always loads music on', () => {
    saveAudioPrefs({ muted: true, volume: 40, musicOn: false })
    expect(loadAudioPrefs()).toEqual({
      muted: false,
      volume: 40,
      musicOn: true,
    })
  })

  it('ignores corrupt JSON and returns defaults', () => {
    localStorage.setItem(AUDIO_PREFS_KEY, '{not-json')
    expect(loadAudioPrefs()).toEqual({
      muted: false,
      volume: 70,
      musicOn: true,
    })
  })

  it('ignores previously saved musicOn false from old sessions', () => {
    localStorage.setItem(
      AUDIO_PREFS_KEY,
      JSON.stringify({ muted: true, volume: 80, musicOn: false }),
    )
    const prefs = loadAudioPrefs()
    expect(prefs.musicOn).toBe(true)
    expect(prefs.muted).toBe(false)
    expect(prefs.volume).toBe(80)
  })
})

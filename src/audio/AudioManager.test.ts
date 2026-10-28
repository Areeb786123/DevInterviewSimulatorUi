import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AudioManager } from './AudioManager'
import type { AudioPrefs } from './types'

function createFakeAudio() {
  const el = {
    src: '',
    loop: false,
    volume: 1,
    muted: false,
    paused: true,
    currentTime: 0,
    play: vi.fn(async () => {
      el.paused = false
    }),
    pause: vi.fn(() => {
      el.paused = true
    }),
    load: vi.fn(),
  }
  return el as unknown as HTMLAudioElement & {
    play: ReturnType<typeof vi.fn>
    pause: ReturnType<typeof vi.fn>
  }
}

describe('AudioManager', () => {
  let prefs: AudioPrefs
  const created: HTMLAudioElement[] = []

  beforeEach(() => {
    prefs = { muted: false, volume: 50, musicOn: true }
    created.length = 0
  })

  function makeManager() {
    return new AudioManager({
      bgmUrl: '/assets/audio/bgm.wav',
      sfx: {
        click: '/assets/audio/click.wav',
        deny: '/assets/audio/deny.wav',
        enter: '/assets/audio/enter.wav',
      },
      loadPrefs: () => ({ ...prefs }),
      savePrefs: (p) => {
        prefs = { ...p }
      },
      createAudio: (src) => {
        const a = createFakeAudio()
        ;(a as { src: string }).src = src
        created.push(a)
        return a
      },
    })
  }

  it('does not play BGM before unlock', () => {
    const m = makeManager()
    m.playBgm()
    expect(created[0]?.play).not.toHaveBeenCalled()
  })

  it('unlock does not start BGM by itself', async () => {
    const m = makeManager()
    await m.unlock()
    const bgm = created[0]
    // unlock probes click SFX only
    expect(bgm.play).not.toHaveBeenCalled()
  })

  it('plays BGM only after unlock + playBgm', async () => {
    const m = makeManager()
    await m.unlock()
    m.playBgm()
    const bgm = created[0]
    expect(bgm.loop).toBe(true)
    expect(bgm.play).toHaveBeenCalled()
    expect(bgm.volume).toBeCloseTo(0.5)
  })

  it('setMuted persists, mutes, and stops BGM', async () => {
    const m = makeManager()
    await m.unlock()
    m.playBgm()
    m.setMuted(true)
    expect(prefs.muted).toBe(true)
    expect(created[0].muted).toBe(true)
    expect(created[0].pause).toHaveBeenCalled()
  })

  it('playSfx is no-op when muted', async () => {
    prefs.muted = true
    const m = makeManager()
    await m.unlock()
    const click = created.find((a) =>
      (a as { src: string }).src.includes('click'),
    )
    // clear unlock probe calls
    ;(click?.play as ReturnType<typeof vi.fn>)?.mockClear()
    m.playSfx('click')
    expect(click?.play).not.toHaveBeenCalled()
  })
})

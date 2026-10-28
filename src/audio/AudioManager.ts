import { clampVolume, loadAudioPrefs, saveAudioPrefs } from './storage'
import type { AudioPrefs, SfxName } from './types'

export type AudioManagerOptions = {
  bgmUrl: string
  sfx: Record<SfxName, string>
  loadPrefs?: () => AudioPrefs
  savePrefs?: (p: AudioPrefs) => void
  createAudio?: (src: string) => HTMLAudioElement
}

export class AudioManager {
  private unlocked = false
  private prefs: AudioPrefs
  private bgm: HTMLAudioElement
  private sfx: Record<SfxName, HTMLAudioElement>
  private savePrefs: (p: AudioPrefs) => void
  private bgmStarted = false

  constructor(opts: AudioManagerOptions) {
    const createAudio = opts.createAudio ?? ((src) => new Audio(src))
    this.savePrefs = opts.savePrefs ?? saveAudioPrefs
    this.prefs = (opts.loadPrefs ?? loadAudioPrefs)()
    this.bgm = createAudio(opts.bgmUrl)
    this.bgm.loop = true
    this.bgm.preload = 'auto'
    this.sfx = {
      click: createAudio(opts.sfx.click),
      deny: createAudio(opts.sfx.deny),
      enter: createAudio(opts.sfx.enter),
    }
    this.applyGain()
  }

  isUnlocked(): boolean {
    return this.unlocked
  }

  isBgmPlaying(): boolean {
    return this.bgmStarted && !this.bgm.paused
  }

  getPrefs(): AudioPrefs {
    return { ...this.prefs }
  }

  /** Unlock audio for SFX only — does not start BGM. */
  async unlock(): Promise<void> {
    if (this.unlocked) return
    try {
      const probe = this.sfx.click
      const prevVol = probe.volume
      probe.volume = 0
      await probe.play()
      probe.pause()
      probe.currentTime = 0
      probe.volume = prevVol
      this.unlocked = true
    } catch {
      this.unlocked = false
      return
    }
    this.applyGain()
  }

  playBgm(): void {
    if (!this.unlocked || this.prefs.muted) return
    this.applyGain()
    void this.bgm.play().then(() => {
      this.bgmStarted = true
    }).catch(() => undefined)
  }

  stopBgm(): void {
    this.bgm.pause()
    this.bgm.currentTime = 0
    this.bgmStarted = false
  }

  playSfx(name: SfxName): void {
    if (!this.unlocked || this.prefs.muted) return
    const node = this.sfx[name]
    node.currentTime = 0
    this.applyGain()
    void node.play().catch(() => undefined)
  }

  setMuted(muted: boolean): void {
    this.prefs = { ...this.prefs, muted }
    this.savePrefs(this.prefs)
    this.applyGain()
    if (muted) {
      this.stopBgm()
    }
  }

  setVolume(volume: number): void {
    this.prefs = {
      ...this.prefs,
      volume: clampVolume(volume),
    }
    this.savePrefs(this.prefs)
    this.applyGain()
  }

  dispose(): void {
    this.stopBgm()
    ;(Object.values(this.sfx) as HTMLAudioElement[]).forEach((a) => a.pause())
  }

  private applyGain(): void {
    const linear = this.prefs.volume / 100
    this.bgm.muted = this.prefs.muted
    this.bgm.volume = linear
    ;(Object.values(this.sfx) as HTMLAudioElement[]).forEach((a) => {
      a.muted = this.prefs.muted
      a.volume = linear
    })
  }
}

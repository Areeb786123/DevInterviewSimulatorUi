export type AudioPrefs = {
  muted: boolean
  volume: number
  /** BGM preference is never restored as playing — always starts off on load. */
  musicOn: boolean
}

export type SfxName = 'click' | 'deny' | 'enter' | 'applause' | 'victory'

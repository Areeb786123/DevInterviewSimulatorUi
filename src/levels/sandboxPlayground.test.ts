import { describe, it, expect } from 'vitest'
import { SANDBOX_PLAYGROUND, CUSTOM_PALETTE_ITEM } from './sandboxPlayground'
import { SOCIAL_MEDIA_PALETTE } from './sharedPalette'
import { SOCIAL_MEDIA_L1 } from './socialMediaL1'
import { SOCIAL_MEDIA_L2 } from './socialMediaL2'
import { SOCIAL_MEDIA_L3_TO_L15 } from './socialMediaL3toL15'

const hasCustom = (p: { kind: string }[]) => p.some((i) => i.kind === 'custom')

describe('custom palette item scoping', () => {
  it('sandbox palette includes custom right after client', () => {
    expect(hasCustom(SANDBOX_PLAYGROUND.palette)).toBe(true)
    expect(SANDBOX_PLAYGROUND.palette).toContain(CUSTOM_PALETTE_ITEM)
    const kinds = SANDBOX_PLAYGROUND.palette.map((p) => p.kind)
    expect(kinds.indexOf('custom')).toBe(kinds.indexOf('client') + 1)
    expect(CUSTOM_PALETTE_ITEM.iconUrl).toBe('/assets/sysdesign/custom.svg')
  })

  it('shared social-media palette does not include custom', () => {
    expect(hasCustom(SOCIAL_MEDIA_PALETTE)).toBe(false)
  })

  it('campaign levels L1-L15 do not include custom', () => {
    for (const lvl of [SOCIAL_MEDIA_L1, SOCIAL_MEDIA_L2, ...SOCIAL_MEDIA_L3_TO_L15]) {
      expect(hasCustom(lvl.palette), lvl.id).toBe(false)
    }
  })
})

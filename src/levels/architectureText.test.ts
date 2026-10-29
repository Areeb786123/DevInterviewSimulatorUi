import { describe, it, expect } from 'vitest'
import {
  buildAutoExplanation,
  formatArchitecturePath,
} from './architectureText'
import { SOCIAL_MEDIA_L1 } from './socialMediaL1'

describe('architectureText', () => {
  it('formats a linear path as client -> app server -> postgres', () => {
    const text = formatArchitecturePath(
      [
        { id: 'c', kind: 'client', x: 0, y: 0 },
        { id: 's', kind: 'server', x: 40, y: 0 },
        { id: 'p', kind: 'postgres', x: 80, y: 0 },
      ],
      [
        { id: 'e1', from: 'c', to: 's' },
        { id: 'e2', from: 's', to: 'p' },
      ],
      SOCIAL_MEDIA_L1.palette,
    )
    expect(text).toMatch(/client/i)
    expect(text).toContain('->')
    expect(text).toMatch(/postgres|sql/i)
  })

  it('builds an auto explanation without requiring user prose', () => {
    const explanation = buildAutoExplanation(
      [{ id: 'c', kind: 'client', x: 0, y: 0 }],
      [],
      SOCIAL_MEDIA_L1,
    )
    expect(explanation).toMatch(/Game architecture path/i)
    expect(explanation.length).toBeGreaterThan(20)
  })
})

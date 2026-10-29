import { describe, it, expect } from 'vitest'
import { canAfford, spentBudget } from './budget'
import { SOCIAL_MEDIA_L1 } from './socialMediaL1'

describe('budget', () => {
  it('sums component costs', () => {
    const spent = spentBudget(SOCIAL_MEDIA_L1, [
      { id: '1', kind: 'client', x: 0, y: 0 },
      { id: '2', kind: 'server', x: 0, y: 0 },
      { id: '3', kind: 'postgres', x: 0, y: 0 },
    ])
    expect(spent).toBe(60)
  })

  it('blocks unaffordable second postgres after lean path', () => {
    const nodes = [
      { id: '1', kind: 'client' as const, x: 0, y: 0 },
      { id: '2', kind: 'server' as const, x: 0, y: 0 },
      { id: '3', kind: 'postgres' as const, x: 0, y: 0 },
    ]
    // 60 + 40 = 100 > 70
    expect(canAfford(SOCIAL_MEDIA_L1, nodes, 'postgres')).toBe(false)
    // Redis is cheaper and still fits: 60+15=75 > 70 actually - check
    expect(canAfford(SOCIAL_MEDIA_L1, nodes, 'redis')).toBe(false)
    // Empty board can afford redis
    expect(canAfford(SOCIAL_MEDIA_L1, [], 'redis')).toBe(true)
  })
})

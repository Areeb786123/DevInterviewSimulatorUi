import { describe, it, expect } from 'vitest'
import { COMPONENT_TIPS, getComponentTip } from './componentTips'
import type { ComponentKind } from './types'

const ALL_KINDS: ComponentKind[] = [
  'client',
  'server',
  'load-balancer',
  'postgres',
  'mongodb',
  'redis',
  'kafka',
  'object-store',
  'cdn',
  'websocket',
  'custom',
]

describe('componentTips', () => {
  it('covers every component kind with what + useWhen', () => {
    for (const kind of ALL_KINDS) {
      const tip = getComponentTip(kind)
      expect(tip.title.length).toBeGreaterThan(0)
      expect(tip.what.length).toBeGreaterThan(10)
      expect(tip.useWhen.length).toBeGreaterThan(10)
    }
    expect(Object.keys(COMPONENT_TIPS).sort()).toEqual([...ALL_KINDS].sort())
  })
})

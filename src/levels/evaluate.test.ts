import { describe, it, expect } from 'vitest'
import { evaluateDesign } from './evaluate'
import { SOCIAL_MEDIA_L1 } from './socialMediaL1'
import { SOCIAL_MEDIA_L2 } from './socialMediaL2'
import {
  SOCIAL_MEDIA_L3,
  SOCIAL_MEDIA_L8,
  SOCIAL_MEDIA_L15,
} from './socialMediaL3toL15'

describe('evaluateDesign L1', () => {
  it('passes client → server → postgres under budget', () => {
    const nodes = [
      { id: 'a', kind: 'client' as const, x: 0, y: 0 },
      { id: 'b', kind: 'server' as const, x: 1, y: 0 },
      { id: 'c', kind: 'postgres' as const, x: 2, y: 0 },
    ]
    const edges = [
      { id: 'e1', from: 'a', to: 'b' },
      { id: 'e2', from: 'b', to: 'c' },
    ]
    expect(evaluateDesign(SOCIAL_MEDIA_L1, nodes, edges).ok).toBe(true)
  })
})

describe('evaluateDesign L2', () => {
  it('passes LB fan-out to two servers', () => {
    const nodes = [
      { id: 'c', kind: 'client' as const, x: 0, y: 0 },
      { id: 'lb', kind: 'load-balancer' as const, x: 1, y: 0 },
      { id: 's1', kind: 'server' as const, x: 2, y: 0 },
      { id: 's2', kind: 'server' as const, x: 2, y: 1 },
      { id: 'db', kind: 'postgres' as const, x: 3, y: 0 },
    ]
    const edges = [
      { id: 'e1', from: 'c', to: 'lb' },
      { id: 'e2', from: 'lb', to: 's1' },
      { id: 'e3', from: 'lb', to: 's2' },
      { id: 'e4', from: 's1', to: 'db' },
    ]
    expect(evaluateDesign(SOCIAL_MEDIA_L2, nodes, edges).ok).toBe(true)
  })

  it('fails with only one app server behind LB', () => {
    const nodes = [
      { id: 'c', kind: 'client' as const, x: 0, y: 0 },
      { id: 'lb', kind: 'load-balancer' as const, x: 1, y: 0 },
      { id: 's1', kind: 'server' as const, x: 2, y: 0 },
      { id: 'db', kind: 'postgres' as const, x: 3, y: 0 },
    ]
    const edges = [
      { id: 'e1', from: 'c', to: 'lb' },
      { id: 'e2', from: 'lb', to: 's1' },
      { id: 'e3', from: 's1', to: 'db' },
    ]
    const result = evaluateDesign(SOCIAL_MEDIA_L2, nodes, edges)
    expect(result.ok).toBe(false)
  })
})

describe('evaluateDesign L3 / L8 / L15', () => {
  it('passes L3 redis path', () => {
    const nodes = [
      { id: 'c', kind: 'client' as const, x: 0, y: 0 },
      { id: 's', kind: 'server' as const, x: 1, y: 0 },
      { id: 'r', kind: 'redis' as const, x: 2, y: 0 },
      { id: 'db', kind: 'postgres' as const, x: 3, y: 0 },
    ]
    const edges = [
      { id: 'e1', from: 'c', to: 's' },
      { id: 'e2', from: 's', to: 'r' },
      { id: 'e3', from: 'r', to: 'db' },
    ]
    expect(evaluateDesign(SOCIAL_MEDIA_L3, nodes, edges).ok).toBe(true)
  })

  it('passes L8 CDN path', () => {
    const nodes = [
      { id: 'c', kind: 'client' as const, x: 0, y: 0 },
      { id: 'cdn', kind: 'cdn' as const, x: 1, y: 0 },
      { id: 'o', kind: 'object-store' as const, x: 2, y: 0 },
    ]
    const edges = [
      { id: 'e1', from: 'c', to: 'cdn' },
      { id: 'e2', from: 'cdn', to: 'o' },
    ]
    expect(evaluateDesign(SOCIAL_MEDIA_L8, nodes, edges).ok).toBe(true)
  })

  it('passes L15 capstone with media pieces placed', () => {
    const nodes = [
      { id: 'c', kind: 'client' as const, x: 0, y: 0 },
      { id: 'lb', kind: 'load-balancer' as const, x: 1, y: 0 },
      { id: 's1', kind: 'server' as const, x: 2, y: 0 },
      { id: 's2', kind: 'server' as const, x: 2, y: 1 },
      { id: 'r', kind: 'redis' as const, x: 3, y: 0 },
      { id: 'db', kind: 'postgres' as const, x: 4, y: 0 },
      { id: 'cdn', kind: 'cdn' as const, x: 5, y: 0 },
      { id: 'o', kind: 'object-store' as const, x: 6, y: 0 },
    ]
    const edges = [
      { id: 'e1', from: 'c', to: 'lb' },
      { id: 'e2', from: 'lb', to: 's1' },
      { id: 'e3', from: 'lb', to: 's2' },
      { id: 'e4', from: 's1', to: 'r' },
      { id: 'e5', from: 'r', to: 'db' },
    ]
    expect(evaluateDesign(SOCIAL_MEDIA_L15, nodes, edges).ok).toBe(true)
  })
})


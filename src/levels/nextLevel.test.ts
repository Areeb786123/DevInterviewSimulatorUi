import { describe, it, expect } from 'vitest'
import { getNextLevel } from './nextLevel'

describe('getNextLevel', () => {
  it('returns level-2 route after level-1', () => {
    expect(getNextLevel('level-1')).toEqual({
      kind: 'next',
      route: '/system-design/social-media/level-2',
      label: 'Level 2',
    })
  })

  it('returns level-3 after level-2', () => {
    expect(getNextLevel('level-2')).toEqual({
      kind: 'next',
      route: '/system-design/social-media/level-3',
      label: 'Level 3',
    })
  })

  it('returns coming-soon after last mapped level', () => {
    expect(getNextLevel('level-15')).toEqual({ kind: 'coming-soon' })
  })

  it('returns coming-soon for unknown id', () => {
    expect(getNextLevel('level-99')).toEqual({ kind: 'coming-soon' })
  })
})


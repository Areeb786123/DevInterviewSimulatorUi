import { describe, it, expect } from 'vitest'
import { buildAbsSortSteps } from './sortByAbsoluteValue'

describe('buildAbsSortSteps', () => {
  it('ends with Example 1 sorted order', () => {
    const steps = buildAbsSortSteps([4, -2, 0, -1, 3])
    const last = steps[steps.length - 1]!
    expect(last.values).toEqual([0, -1, -2, 3, 4])
  })
})

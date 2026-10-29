import { describe, it, expect } from 'vitest'
import { buildTransformSteps, simulateUserSort } from './simulateUserSort'

const goodSort = `
function sortByAbsoluteValue(nums) {
  return nums.slice().sort((a, b) => {
    const aa = Math.abs(a), bb = Math.abs(b);
    if (aa !== bb) return aa - bb;
    return a - b;
  });
}
`

describe('simulateUserSort', () => {
  it('traces comparator steps when user uses .sort', () => {
    const out = simulateUserSort(goodSort, [4, -2, 0, -1, 3])
    expect(out.error).toBeUndefined()
    expect(out.traced).toBe(true)
    expect(out.result).toEqual([0, -1, -2, 3, 4])
    expect(out.steps.length).toBeGreaterThan(5)
    expect(out.steps.some((s) => s.narration.includes('comparator'))).toBe(true)
  })

  it('falls back to transform when user returns without .sort', () => {
    const stub = `
function sortByAbsoluteValue(nums) {
  return [0, -1, -2, 3, 4];
}
`
    const out = simulateUserSort(stub, [4, -2, 0, -1, 3])
    expect(out.traced).toBe(false)
    expect(out.result).toEqual([0, -1, -2, 3, 4])
    expect(out.steps.at(-1)?.values).toEqual([0, -1, -2, 3, 4])
  })
})

describe('buildTransformSteps', () => {
  it('reaches the end array', () => {
    const steps = buildTransformSteps([4, -2, 0, -1, 3], [0, -1, -2, 3, 4])
    expect(steps.at(-1)?.values).toEqual([0, -1, -2, 3, 4])
  })
})

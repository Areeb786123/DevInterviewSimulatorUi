import { describe, it, expect } from 'vitest'
import { runJavascriptSort } from './runJavascript'
import { SORT_BY_ABSOLUTE_VALUE } from './sortByAbsoluteValue'

const good = `
function sortByAbsoluteValue(nums) {
  return nums.slice().sort((a, b) => {
    const aa = Math.abs(a), bb = Math.abs(b);
    if (aa !== bb) return aa - bb;
    return a - b;
  });
}
`

describe('runJavascriptSort', () => {
  it('passes all cases for a correct solution', () => {
    if (SORT_BY_ABSOLUTE_VALUE.kind !== 'array-sort') throw new Error('bad kind')
    const results = runJavascriptSort(good, SORT_BY_ABSOLUTE_VALUE.tests)
    expect(results.every((r) => r.ok)).toBe(true)
  })

  it('fails starter stub', () => {
    if (SORT_BY_ABSOLUTE_VALUE.kind !== 'array-sort') throw new Error('bad kind')
    const results = runJavascriptSort(
      SORT_BY_ABSOLUTE_VALUE.starterCode.javascript,
      SORT_BY_ABSOLUTE_VALUE.tests,
    )
    expect(results.some((r) => !r.ok)).toBe(true)
  })
})


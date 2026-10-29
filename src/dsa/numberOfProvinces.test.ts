import { describe, it, expect } from 'vitest'
import {
  buildProvincesDfsSteps,
  NUMBER_OF_PROVINCES,
  PROVINCES_SIM_MATRIX,
} from './numberOfProvinces'
import { runJavascriptProvinces } from './runJavascript'

const good = `
function findCircleNum(isConnected) {
  const n = isConnected.length;
  const seen = Array(n).fill(false);
  let count = 0;
  function dfs(i) {
    seen[i] = true;
    for (let j = 0; j < n; j++) {
      if (isConnected[i][j] && !seen[j]) dfs(j);
    }
  }
  for (let i = 0; i < n; i++) {
    if (!seen[i]) { count++; dfs(i); }
  }
  return count;
}
`

describe('number of provinces', () => {
  it('DFS steps end with 2 provinces on sim matrix', () => {
    const steps = buildProvincesDfsSteps(PROVINCES_SIM_MATRIX)
    expect(steps.at(-1)?.provinceCount).toBe(2)
  })

  it('passes all tests for a correct JS solution', () => {
    if (NUMBER_OF_PROVINCES.kind !== 'graph-provinces') {
      throw new Error('bad kind')
    }
    const results = runJavascriptProvinces(good, NUMBER_OF_PROVINCES.tests)
    expect(results.every((r) => r.ok)).toBe(true)
  })
})


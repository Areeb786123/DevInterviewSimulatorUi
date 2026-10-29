import type { ArrayTestCase, GraphTestCase } from './types'

export type TestRunResult = {
  id: string
  label: string
  hidden?: boolean
  ok: boolean
  actual?: string
  expected: string
  error?: string
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

function loadFn(source: string, name: string): ((...args: never[]) => unknown) | { error: string } {
  try {
    // eslint-disable-next-line no-new-func -- MVP runner
    const factory = new Function(
      `${source}\n; return typeof ${name} === 'function' ? ${name} : null;`,
    )
    const resolved = factory()
    if (typeof resolved !== 'function') {
      return { error: `Define function ${name}(...)` }
    }
    return resolved as (...args: never[]) => unknown
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

export function runJavascriptSort(
  source: string,
  tests: ArrayTestCase[],
): TestRunResult[] {
  const loaded = loadFn(source, 'sortByAbsoluteValue')
  if ('error' in loaded) {
    return tests.map((t) => ({
      id: t.id,
      label: t.label,
      hidden: t.hidden,
      ok: false,
      expected: `[${t.expected.join(', ')}]`,
      error: loaded.error,
    }))
  }
  const fn = loaded as (nums: number[]) => unknown

  return tests.map((t) => {
    try {
      const actual = fn(t.input.slice())
      if (!Array.isArray(actual) || !actual.every((x) => typeof x === 'number')) {
        return {
          id: t.id,
          label: t.label,
          hidden: t.hidden,
          ok: false,
          expected: `[${t.expected.join(', ')}]`,
          error: 'Return a number[]',
        }
      }
      const nums = actual as number[]
      return {
        id: t.id,
        label: t.label,
        hidden: t.hidden,
        ok: arraysEqual(nums, t.expected),
        actual: `[${nums.join(', ')}]`,
        expected: `[${t.expected.join(', ')}]`,
      }
    } catch (e) {
      return {
        id: t.id,
        label: t.label,
        hidden: t.hidden,
        ok: false,
        expected: `[${t.expected.join(', ')}]`,
        error: e instanceof Error ? e.message : String(e),
      }
    }
  })
}

export function runJavascriptProvinces(
  source: string,
  tests: GraphTestCase[],
): TestRunResult[] {
  const loaded = loadFn(source, 'findCircleNum')
  if ('error' in loaded) {
    return tests.map((t) => ({
      id: t.id,
      label: t.label,
      hidden: t.hidden,
      ok: false,
      expected: String(t.expected),
      error: loaded.error,
    }))
  }
  const fn = loaded as (matrix: number[][]) => unknown

  return tests.map((t) => {
    try {
      const matrix = t.input.map((row) => row.slice())
      const actual = fn(matrix)
      if (typeof actual !== 'number' || !Number.isFinite(actual)) {
        return {
          id: t.id,
          label: t.label,
          hidden: t.hidden,
          ok: false,
          expected: String(t.expected),
          error: 'Return a number',
        }
      }
      return {
        id: t.id,
        label: t.label,
        hidden: t.hidden,
        ok: actual === t.expected,
        actual: String(actual),
        expected: String(t.expected),
      }
    } catch (e) {
      return {
        id: t.id,
        label: t.label,
        hidden: t.hidden,
        ok: false,
        expected: String(t.expected),
        error: e instanceof Error ? e.message : String(e),
      }
    }
  })
}

/** Run user findCircleNum once on the sim matrix (for end-of-sim comparison). */
export function evalFindCircleNum(
  source: string,
  matrix: number[][],
): { value?: number; error?: string } {
  const loaded = loadFn(source, 'findCircleNum')
  if ('error' in loaded) return { error: loaded.error }
  try {
    const actual = (loaded as (m: number[][]) => unknown)(
      matrix.map((r) => r.slice()),
    )
    if (typeof actual !== 'number' || !Number.isFinite(actual)) {
      return { error: 'Return a number' }
    }
    return { value: actual }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

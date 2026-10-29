import type { SimStep } from './types'

export type UserSimResult = {
  steps: SimStep[]
  result?: number[]
  error?: string
  /** True when we traced Array.prototype.sort / comparator calls from their code */
  traced: boolean
}

function loadSortFn(
  source: string,
): ((nums: number[]) => unknown) | { error: string } {
  try {
    // eslint-disable-next-line no-new-func -- MVP runner
    const factory = new Function(
      `${source}\n; return typeof sortByAbsoluteValue === 'function' ? sortByAbsoluteValue : null;`,
    )
    const resolved = factory()
    if (typeof resolved !== 'function') {
      return { error: 'Define function sortByAbsoluteValue(nums) first.' }
    }
    return resolved as (nums: number[]) => unknown
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

/** Animate transforming `start` into `end` with selection-style swaps. */
export function buildTransformSteps(start: number[], end: number[]): SimStep[] {
  const a = start.slice()
  const steps: SimStep[] = [
    {
      values: a.slice(),
      focus: [],
      line: 0,
      narration: `Start with your input: [${a.join(', ')}]`,
    },
  ]

  for (let i = 0; i < end.length; i++) {
    if (a[i] === end[i]) continue
    let k = i + 1
    while (k < a.length && a[k] !== end[i]) k++
    if (k >= a.length) break
    steps.push({
      values: a.slice(),
      focus: [i, k],
      line: 0,
      narration: `Your result needs ${end[i]} at index ${i} — bring it from index ${k}.`,
    })
    const tmp = a[i]!
    a[i] = a[k]!
    a[k] = tmp
    steps.push({
      values: a.slice(),
      focus: [i, k],
      swapped: [i, k],
      line: 0,
      narration: `Swap → [${a.join(', ')}]`,
    })
  }

  steps.push({
    values: a.slice(),
    focus: [],
    line: 0,
    narration: `Your function returned [${end.join(', ')}]`,
  })
  return steps
}

/**
 * Run the learner's JS and build ball steps.
 * If they use `.sort(comparator)`, we trace their comparator comparisons.
 * Otherwise we animate a path from input → their returned array.
 */
export function simulateUserSort(
  source: string,
  input: number[],
): UserSimResult {
  const loaded = loadSortFn(source)
  if ('error' in loaded) {
    return {
      traced: false,
      steps: [
        {
          values: input.slice(),
          focus: [],
          line: 0,
          narration: loaded.error,
        },
      ],
      error: loaded.error,
    }
  }

  const fn = loaded
  const steps: SimStep[] = [
    {
      values: input.slice(),
      focus: [],
      line: 0,
      narration: 'Calling your sortByAbsoluteValue on the 5 balls…',
    },
  ]

  let traced = false
  const originalSort = Array.prototype.sort

  Array.prototype.sort = function (this: unknown[], compareFn?: (a: number, b: number) => number) {
    traced = true
    const arr = this as number[]
    const cmp =
      compareFn ??
      ((x: number, y: number) => (x === y ? 0 : x < y ? -1 : 1))

    steps.push({
      values: arr.slice(),
      focus: [],
      line: 0,
      narration: 'Your code called .sort — watching your comparator on each pair…',
    })

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - 1 - i; j++) {
        const left = arr[j]!
        const right = arr[j + 1]!
        steps.push({
          values: arr.slice(),
          focus: [j, j + 1],
          line: 0,
          narration: `Your comparator checks ${left} vs ${right} (|${Math.abs(left)}| vs |${Math.abs(right)}|).`,
        })
        let order = 0
        try {
          order = cmp(left, right)
        } catch (e) {
          Array.prototype.sort = originalSort
          throw e
        }
        if (order > 0) {
          arr[j] = right
          arr[j + 1] = left
          steps.push({
            values: arr.slice(),
            focus: [j, j + 1],
            swapped: [j, j + 1],
            line: 0,
            narration: `Your comparator says swap → [${arr.join(', ')}]`,
          })
        } else {
          steps.push({
            values: arr.slice(),
            focus: [j, j + 1],
            line: 0,
            narration: 'Your comparator keeps this order — no swap.',
          })
        }
      }
    }
    return arr
  } as typeof Array.prototype.sort

  try {
    const raw = fn(input.slice())
    Array.prototype.sort = originalSort

    if (!Array.isArray(raw) || !raw.every((x) => typeof x === 'number')) {
      return {
        traced,
        error: 'Your function must return a number[]',
        steps: [
          ...steps,
          {
            values: input.slice(),
            focus: [],
            line: 0,
            narration: 'Your function must return a number[]',
          },
        ],
      }
    }

    const result = raw as number[]

    if (!traced) {
      return {
        traced: false,
        result,
        steps: buildTransformSteps(input, result),
      }
    }

    steps.push({
      values: result.slice(),
      focus: [],
      line: 0,
      narration: `Done — your function returned [${result.join(', ')}]`,
    })
    return { traced: true, result, steps }
  } catch (e) {
    Array.prototype.sort = originalSort
    const msg = e instanceof Error ? e.message : String(e)
    return {
      traced,
      error: msg,
      steps: [
        ...steps,
        {
          values: input.slice(),
          focus: [],
          line: 0,
          narration: `Error in your code: ${msg}`,
        },
      ],
    }
  }
}

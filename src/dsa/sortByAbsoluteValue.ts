import type { DsaQuestion, SimStep } from './types'

const REFERENCE = `function sortByAbsoluteValue(nums) {
  const a = nums.slice();
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      const left = Math.abs(a[j]);
      const right = Math.abs(a[j + 1]);
      // smaller abs first; if tie, smaller number first
      if (left > right || (left === right && a[j] > a[j + 1])) {
        const t = a[j];
        a[j] = a[j + 1];
        a[j + 1] = t;
      }
    }
  }
  return a;
}`

/** Build bubble-sort-by-abs steps for the fixed 5-ball demo. */
export function buildAbsSortSteps(start: number[]): SimStep[] {
  const a = start.slice()
  const steps: SimStep[] = [
    {
      values: a.slice(),
      focus: [],
      line: 2,
      narration: 'Copy the array so we can rearrange it safely.',
    },
  ]

  for (let i = 0; i < a.length; i++) {
    steps.push({
      values: a.slice(),
      focus: [],
      line: 3,
      narration: `Outer pass i = ${i}. Largest remaining abs will settle toward the end.`,
    })
    for (let j = 0; j < a.length - 1 - i; j++) {
      const left = Math.abs(a[j]!)
      const right = Math.abs(a[j + 1]!)
      steps.push({
        values: a.slice(),
        focus: [j, j + 1],
        line: 5,
        narration: `Compare |${a[j]}|=${left} with |${a[j + 1]}|=${right}.`,
      })
      steps.push({
        values: a.slice(),
        focus: [j, j + 1],
        line: 8,
        narration:
          left > right || (left === right && a[j]! > a[j + 1]!)
            ? 'Out of order — swap needed.'
            : 'Already in order — no swap.',
      })
      if (left > right || (left === right && a[j]! > a[j + 1]!)) {
        const t = a[j]!
        a[j] = a[j + 1]!
        a[j + 1] = t
        steps.push({
          values: a.slice(),
          focus: [j, j + 1],
          swapped: [j, j + 1],
          line: 10,
          narration: `Swap → [${a.join(', ')}]`,
        })
      }
    }
  }

  steps.push({
    values: a.slice(),
    focus: [],
    line: 15,
    narration: `Done. Sorted by absolute value: [${a.join(', ')}]`,
  })
  return steps
}

const SIM_START = [4, -2, 0, -1, 3]

export const SORT_BY_ABSOLUTE_VALUE: DsaQuestion = {
  kind: 'array-sort',
  id: 'sort-by-absolute-value',
  title: 'Sort Array By Absolute Value',
  difficulty: 'Easy',
  statement:
    'You are given an integer array nums.\n\n' +
    'Rearrange the elements of the array in non-decreasing order of their absolute values.\n\n' +
    'If two elements have the same absolute value, then place the smaller number first.\n\n' +
    'Return the rearranged array.\n\n' +
    'The absolute value of an integer x is defined as:\n' +
    '• x, if x ≥ 0\n' +
    '• -x, if x < 0',
  examples: [
    {
      input: 'nums = [4, -2, 0, -1, 3]',
      output: '[0, -1, -2, 3, 4]',
      explanation:
        'Absolute values → [4, 2, 0, 1, 3]\nSorted by absolute value → [0, 1, 2, 3, 4]\nFinal arrangement → [0, -1, -2, 3, 4]',
    },
    {
      input: 'nums = [-7, 5, -3, 2]',
      output: '[2, -3, 5, -7]',
      explanation:
        'Absolute values → [7, 5, 3, 2]\nSorted absolute values → [2, 3, 5, 7]\nFinal result → [2, -3, 5, -7]',
    },
  ],
  constraints: [
    '1 ≤ nums.length ≤ 10^5 (in real interviews; our tests stay small)',
    'nums[i] is an integer',
  ],
  starterCode: {
    javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 * Tip: use .sort(comparator) so the 5-ball simulator can show each compare/swap from YOUR code.
 */
function sortByAbsoluteValue(nums) {
  // TODO: rearrange by absolute value
  // Example shape (fill in the comparator):
  // return nums.slice().sort((a, b) => { ... });
  return nums;
}
`,
    python: `def sort_by_absolute_value(nums: list[int]) -> list[int]:
    # TODO: rearrange by absolute value
    return nums
`,
    java: `class Solution {
    public int[] sortByAbsoluteValue(int[] nums) {
        // TODO: rearrange by absolute value
        return nums;
    }
}
`,
    kotlin: `class Solution {
    fun sortByAbsoluteValue(nums: IntArray): IntArray {
        // TODO: rearrange by absolute value
        return nums
    }
}
`,
    c: `#include <stdlib.h>

// Write into out (length n). Caller owns memory.
void sortByAbsoluteValue(const int* nums, int n, int* out) {
    // TODO: rearrange by absolute value
    for (int i = 0; i < n; i++) out[i] = nums[i];
}
`,
    cpp: `#include <vector>
#include <cmath>
using namespace std;

vector<int> sortByAbsoluteValue(vector<int> nums) {
    // TODO: rearrange by absolute value
    return nums;
}
`,
    go: `package main

func sortByAbsoluteValue(nums []int) []int {
    // TODO: rearrange by absolute value
    return nums
}
`,
    rust: `pub fn sort_by_absolute_value(nums: Vec<i32>) -> Vec<i32> {
    // TODO: rearrange by absolute value
    nums
}
`,
  },
  referenceSource: REFERENCE,
  simValues: SIM_START,
  simSteps: buildAbsSortSteps(SIM_START),
  tests: [
    {
      id: 'ex1',
      label: 'Example 1',
      input: [4, -2, 0, -1, 3],
      expected: [0, -1, -2, 3, 4],
    },
    {
      id: 'ex2',
      label: 'Example 2',
      input: [-7, 5, -3, 2],
      expected: [2, -3, 5, -7],
    },
    {
      id: 'hidden-ties',
      label: 'Hidden — ties',
      input: [2, -2, 1, -1, 0],
      expected: [0, -1, 1, -2, 2],
      hidden: true,
    },
  ],
  runnable: ['javascript'],
}

import type { DsaQuestion, GraphSimStep } from './types'

/** Demo graph for simulator: cities 0-1-2 linked, 3-4 linked → 2 provinces */
export const PROVINCES_SIM_MATRIX: number[][] = [
  [1, 1, 0, 0, 0],
  [1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1],
  [0, 0, 0, 1, 1],
]

export function buildProvincesDfsSteps(matrix: number[][]): GraphSimStep[] {
  const n = matrix.length
  const visited = Array.from({ length: n }, () => false)
  const provinceOf: (number | null)[] = Array.from({ length: n }, () => null)
  const steps: GraphSimStep[] = [
    {
      visited: visited.slice(),
      provinceOf: provinceOf.slice(),
      activeNode: null,
      activeEdge: null,
      provinceCount: 0,
      narration:
        'Graph ready. We DFS from each unvisited city; each new start is a new province.',
    },
  ]

  let provinceCount = 0

  function snapshot(
    activeNode: number | null,
    activeEdge: [number, number] | null,
    narration: string,
  ) {
    steps.push({
      visited: visited.slice(),
      provinceOf: provinceOf.slice(),
      activeNode,
      activeEdge,
      provinceCount,
      narration,
    })
  }

  function dfs(u: number, provinceId: number) {
    visited[u] = true
    provinceOf[u] = provinceId
    snapshot(u, null, `Visit city ${u} — mark province #${provinceId + 1}.`)
    for (let v = 0; v < n; v++) {
      if (u === v || matrix[u]![v] !== 1) continue
      snapshot(u, [u, v], `Check road ${u} ↔ ${v}.`)
      if (!visited[v]) {
        snapshot(v, [u, v], `Road open — DFS into city ${v}.`)
        dfs(v, provinceId)
      } else {
        snapshot(u, [u, v], `City ${v} already visited — skip.`)
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue
    provinceCount += 1
    snapshot(
      i,
      null,
      `Unvisited city ${i} → start province #${provinceCount}.`,
    )
    dfs(i, provinceCount - 1)
  }

  snapshot(
    null,
    null,
    `Done. Total provinces = ${provinceCount}.`,
  )
  return steps
}

export const NUMBER_OF_PROVINCES: DsaQuestion = {
  kind: 'graph-provinces',
  id: 'number-of-provinces',
  title: 'Number of Provinces',
  difficulty: 'Medium',
  statement:
    'You are given an integer n representing the number of cities, labeled from 0 to n - 1, and an n × n matrix isConnected where:\n\n' +
    '• isConnected[i][j] = 1 means there is a direct road between city i and city j\n' +
    '• isConnected[i][j] = 0 means there is no direct road\n\n' +
    'The matrix is symmetric: if i is connected to j, then j is connected to i. Also isConnected[i][i] = 1 for every i.\n\n' +
    'A province is a group of cities connected directly or indirectly through roads (a connected component in an undirected graph).\n\n' +
    'Return the total number of provinces.',
  examples: [
    {
      input: 'isConnected = [[1,1,0],[1,1,0],[0,0,1]]',
      output: '2',
      explanation:
        'Cities 0 and 1 form one province. City 2 is alone → 2 provinces.',
    },
    {
      input: 'isConnected = [[1,0,0],[0,1,0],[0,0,1]]',
      output: '3',
      explanation: 'No roads between different cities → 3 provinces.',
    },
    {
      input:
        'isConnected = [[1,1,0,0],[1,1,1,0],[0,1,1,0],[0,0,0,1]]',
      output: '2',
      explanation: 'Cities 0-1-2 connected; city 3 alone → 2 provinces.',
    },
  ],
  constraints: [
    '1 ≤ n ≤ 200',
    'isConnected[i][j] is 0 or 1',
    'isConnected[i][i] == 1',
    'isConnected[i][j] == isConnected[j][i]',
  ],
  starterCode: {
    javascript: `/**
 * @param {number[][]} isConnected
 * @return {number}
 */
function findCircleNum(isConnected) {
  // TODO: count connected components (provinces)
  return 0;
}
`,
    python: `def find_circle_num(is_connected: list[list[int]]) -> int:
    # TODO: count connected components (provinces)
    return 0
`,
    java: `class Solution {
    public int findCircleNum(int[][] isConnected) {
        // TODO: count connected components (provinces)
        return 0;
    }
}
`,
    kotlin: `class Solution {
    fun findCircleNum(isConnected: Array<IntArray>): Int {
        // TODO: count connected components (provinces)
        return 0
    }
}
`,
    c: `int findCircleNum(int** isConnected, int n) {
    // TODO: count connected components (provinces)
    (void)isConnected;
    return 0;
}
`,
    cpp: `#include <vector>
using namespace std;

int findCircleNum(vector<vector<int>>& isConnected) {
    // TODO: count connected components (provinces)
    return 0;
}
`,
    go: `package main

func findCircleNum(isConnected [][]int) int {
    // TODO: count connected components (provinces)
    return 0
}
`,
    rust: `pub fn find_circle_num(is_connected: Vec<Vec<i32>>) -> i32 {
    // TODO: count connected components (provinces)
    0
}
`,
  },
  simMatrix: PROVINCES_SIM_MATRIX,
  tests: [
    {
      id: 'ex1',
      label: 'Example 1',
      input: [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 1],
      ],
      expected: 2,
    },
    {
      id: 'ex2',
      label: 'Example 2',
      input: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      expected: 3,
    },
    {
      id: 'ex3',
      label: 'Example 3',
      input: [
        [1, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 1],
      ],
      expected: 2,
    },
    {
      id: 'hidden-five',
      label: 'Hidden — 5 cities',
      input: PROVINCES_SIM_MATRIX,
      expected: 2,
      hidden: true,
    },
  ],
  runnable: ['javascript'],
}

import { spentBudget } from './budget'
import type { Edge, LevelConfig, PlacedNode } from './types'

export type EvalResult = {
  ok: boolean
  reason: string
  code?: 'path' | 'budget' | 'time' | 'counts' | 'fanout'
}

/** Path + budget + min counts + optional LB fan-out (timer checked by UI). */
export function evaluateDesign(
  level: LevelConfig,
  nodes: PlacedNode[],
  edges: Edge[],
): EvalResult {
  const spent = spentBudget(level, nodes)
  if (spent > level.budget) {
    return { ok: false, reason: 'over budget', code: 'budget' }
  }

  const { requiredPath, minCounts, fanOut } = level.win

  if (minCounts) {
    for (const [kind, min] of Object.entries(minCounts)) {
      const count = nodes.filter((n) => n.kind === kind).length
      if (count < (min ?? 0)) {
        return {
          ok: false,
          reason: `Need at least ${min}× ${kind}`,
          code: 'counts',
        }
      }
    }
  }

  if (fanOut) {
    const sources = nodes.filter((n) => n.kind === fanOut.fromKind)
    const byId = new Map(nodes.map((n) => [n.id, n]))
    let best = 0
    for (const src of sources) {
      const targets = new Set<string>()
      for (const e of edges) {
        if (e.from !== src.id) continue
        const t = byId.get(e.to)
        if (t?.kind === fanOut.toKind) targets.add(t.id)
      }
      best = Math.max(best, targets.size)
    }
    if (best < fanOut.min) {
      return {
        ok: false,
        reason: `${fanOut.fromKind} must link to ${fanOut.min}+ ${fanOut.toKind}`,
        code: 'fanout',
      }
    }
  }

  if (requiredPath.length === 0) return { ok: true, reason: 'ok' }

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const out = new Map<string, string[]>()
  for (const e of edges) {
    const list = out.get(e.from) ?? []
    list.push(e.to)
    out.set(e.from, list)
  }

  const starts = nodes.filter((n) => n.kind === requiredPath[0])
  if (starts.length === 0) {
    return { ok: false, reason: `Missing ${requiredPath[0]}`, code: 'path' }
  }

  for (const start of starts) {
    if (matchFrom(start.id, 0)) {
      return { ok: true, reason: 'path ok' }
    }
  }

  return {
    ok: false,
    reason: `Need path ${requiredPath.join(' → ')}`,
    code: 'path',
  }

  function matchFrom(nodeId: string, pathIndex: number): boolean {
    const node = byId.get(nodeId)
    if (!node) return false
    if (node.kind !== requiredPath[pathIndex]) return false
    if (pathIndex === requiredPath.length - 1) return true
    const nexts = out.get(nodeId) ?? []
    return nexts.some((nid) => matchFrom(nid, pathIndex + 1))
  }
}

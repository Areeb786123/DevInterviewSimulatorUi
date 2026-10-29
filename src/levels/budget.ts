import type { LevelConfig, PlacedNode } from './types'

export function costByKind(level: LevelConfig): Map<string, number> {
  return new Map(level.palette.map((p) => [p.kind, p.cost]))
}

export function spentBudget(level: LevelConfig, nodes: PlacedNode[]): number {
  const costs = costByKind(level)
  return nodes.reduce((sum, n) => sum + (costs.get(n.kind) ?? 0), 0)
}

export function canAfford(
  level: LevelConfig,
  nodes: PlacedNode[],
  kind: string,
): boolean {
  const costs = costByKind(level)
  const next = spentBudget(level, nodes) + (costs.get(kind) ?? 0)
  return next <= level.budget
}
